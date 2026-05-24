import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.QA_URL || "http://127.0.0.1:4173";
const CDP_ENDPOINT = process.env.CDP_ENDPOINT || "http://localhost:9222";
const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");
const OUTPUT_DIR = path.resolve("qa", "evidence", RUN_ID);
const IS_PRODUCTION_TARGET = /^https:\/\/(www\.)?bah-oil-gas\.com\/?/i.test(BASE_URL);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Timed out connecting to Chrome CDP")), 10000);
      this.ws.addEventListener("open", () => {
        clearTimeout(timer);
        resolve();
      });
      this.ws.addEventListener("error", (event) => {
        clearTimeout(timer);
        reject(new Error(`Chrome CDP WebSocket error: ${event.message || "unknown"}`));
      });
    });

    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject, timer } = this.pending.get(message.id);
        clearTimeout(timer);
        this.pending.delete(message.id);
        if (message.error) {
          reject(new Error(`${message.error.message || "CDP command failed"}: ${JSON.stringify(message.error)}`));
        } else {
          resolve(message.result || {});
        }
        return;
      }

      const handlers = this.handlers.get(message.method);
      if (handlers) {
        for (const handler of handlers) handler(message.params || {});
      }
    });
  }

  on(method, handler) {
    const handlers = this.handlers.get(method) || [];
    handlers.push(handler);
    this.handlers.set(method, handlers);
  }

  waitFor(method, predicate = () => true, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const handler = (params) => {
        if (!predicate(params)) return;
        clearTimeout(timer);
        const handlers = this.handlers.get(method) || [];
        this.handlers.set(method, handlers.filter((candidate) => candidate !== handler));
        resolve(params);
      };
      const timer = setTimeout(() => {
        const handlers = this.handlers.get(method) || [];
        this.handlers.set(method, handlers.filter((candidate) => candidate !== handler));
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeout);
      this.on(method, handler);
    });
  }

  send(method, params = {}, timeout = 20000) {
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out running ${method}`));
      }, timeout);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(payload);
    });
  }

  close() {
    this.ws?.close();
  }
}

const jsString = (value) => JSON.stringify(value);

async function getPageTarget() {
  const targets = await fetch(`${CDP_ENDPOINT}/json/list`).then((response) => response.json());
  const targetHost = new URL(BASE_URL).host;
  const page = targets.find((target) => target.type === "page" && target.url.includes(targetHost))
    || targets.find((target) => target.type === "page");

  if (!page) {
    throw new Error(`No Chrome page target found at ${CDP_ENDPOINT}. Launch Chrome with --remote-debugging-port=9222 first.`);
  }

  return page;
}

function assertTargetAllowed() {
  if (IS_PRODUCTION_TARGET && process.env.QA_ALLOW_PRODUCTION !== "1") {
    throw new Error("Refusing production QA without QA_ALLOW_PRODUCTION=1. Use QA_URL for local/staging, or explicitly opt into production.");
  }
}

function normalizeIssue(issue) {
  return {
    ...issue,
    url: issue.url?.replace(/[?#].*$/, "") || issue.url,
  };
}

async function main() {
  assertTargetAllowed();
  await mkdir(OUTPUT_DIR, { recursive: true });

  const target = await getPageTarget();
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  const run = {
    baseUrl: BASE_URL,
    cdpEndpoint: CDP_ENDPOINT,
    startedAt: new Date().toISOString(),
    chromeTarget: {
      id: target.id,
      initialUrl: target.url,
      title: target.title,
    },
    steps: [],
  };

  let activeStep = null;

  cdp.on("Runtime.consoleAPICalled", (params) => {
    if (!activeStep) return;
    if (!["error", "warning", "assert"].includes(params.type)) return;
    activeStep.console.push({
      type: params.type,
      text: params.args?.map((arg) => arg.value || arg.description || arg.type).join(" ").slice(0, 1000),
    });
  });

  cdp.on("Runtime.exceptionThrown", (params) => {
    if (!activeStep) return;
    activeStep.exceptions.push({
      text: params.exceptionDetails?.text,
      description: params.exceptionDetails?.exception?.description,
      lineNumber: params.exceptionDetails?.lineNumber,
      columnNumber: params.exceptionDetails?.columnNumber,
    });
  });

  cdp.on("Log.entryAdded", (params) => {
    if (!activeStep) return;
    if (!["error", "warning"].includes(params.entry?.level)) return;
    activeStep.logEntries.push({
      level: params.entry.level,
      text: params.entry.text,
      source: params.entry.source,
      url: params.entry.url,
    });
  });

  cdp.on("Network.responseReceived", (params) => {
    if (!activeStep) return;
    const status = params.response?.status || 0;
    if (status >= 400) {
      activeStep.networkIssues.push(normalizeIssue({
        kind: "http-status",
        status,
        statusText: params.response.statusText,
        type: params.type,
        url: params.response.url,
      }));
    }
  });

  cdp.on("Network.loadingFailed", (params) => {
    if (!activeStep) return;
    activeStep.networkIssues.push(normalizeIssue({
      kind: "loading-failed",
      errorText: params.errorText,
      type: params.type,
      blockedReason: params.blockedReason,
      requestId: params.requestId,
    }));
  });

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Log.enable");
  await cdp.send("Performance.enable");

  async function evaluate(expression, awaitPromise = false) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      awaitPromise,
      returnByValue: true,
      userGesture: true,
    });

    if (result.exceptionDetails) {
      return {
        evaluationError: result.exceptionDetails.exception?.description || result.exceptionDetails.text,
      };
    }

    return result.result?.value;
  }

  async function setViewport(width, height, mobile = false) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: mobile ? 2 : 1,
      mobile,
    });
  }

  async function navigate(pathname, label, viewport, waitMs = 1800) {
    await setViewport(viewport.width, viewport.height, viewport.mobile);
    activeStep = {
      label,
      pathname,
      viewport,
      startedAt: new Date().toISOString(),
      console: [],
      exceptions: [],
      logEntries: [],
      networkIssues: [],
      observations: {},
    };

    const load = cdp.waitFor("Page.loadEventFired", () => true, 20000).catch((error) => ({ timeout: error.message }));
    await cdp.send("Page.navigate", { url: new URL(pathname, BASE_URL).toString() });
    activeStep.loadEvent = await load;
    await sleep(waitMs);
    activeStep.snapshot = await collectSnapshot();
    activeStep.performance = await collectPerformance();
    run.steps.push(activeStep);
    return activeStep;
  }

  async function collectSnapshot() {
    return evaluate(`(() => {
      const visible = (el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      };
      const accessibleName = (el) => (el.getAttribute("aria-label") || el.innerText || el.value || el.placeholder || el.getAttribute("title") || "").replace(/\\s+/g, " ").trim();
      const rectFor = (el) => {
        const rect = el.getBoundingClientRect();
        return {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      };
      const controls = [...document.querySelectorAll("a,button,input,select,textarea,[role='button'],[tabindex]")]
        .filter(visible)
        .slice(0, 120)
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute("type"),
          text: accessibleName(el).slice(0, 120),
          href: el.href || null,
          ariaLabel: el.getAttribute("aria-label"),
          ariaExpanded: el.getAttribute("aria-expanded"),
          rect: rectFor(el),
        }));
      const smallTouchTargets = controls.filter((control) => ["a", "button"].includes(control.tag) && (control.rect.width < 44 || control.rect.height < 44));
      const headings = [...document.querySelectorAll("h1,h2,h3")].slice(0, 40).map((el) => ({
        level: el.tagName.toLowerCase(),
        text: el.innerText.replace(/\\s+/g, " ").trim().slice(0, 160),
      }));
      const images = [...document.images].slice(0, 80).map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.getAttribute("alt"),
        visible: visible(img),
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }));
      const overflowElements = [...document.body.querySelectorAll("*")]
        .filter((el) => visible(el) && el.getBoundingClientRect().right > window.innerWidth + 5)
        .slice(0, 12)
        .map((el) => ({ tag: el.tagName.toLowerCase(), id: el.id || null, className: String(el.className || "").slice(0, 160), rect: rectFor(el), text: accessibleName(el).slice(0, 120) }));
      const forms = [...document.forms].map((form) => ({
        action: form.action,
        method: form.method,
        controls: [...form.elements].map((el) => ({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          name: el.name || null,
          type: el.type || null,
          required: Boolean(el.required),
          autocomplete: el.getAttribute("autocomplete"),
          label: el.labels?.[0]?.innerText || null,
        })),
      }));
      return {
        url: location.href,
        pathname: location.pathname,
        title: document.title,
        readyState: document.readyState,
        isSecureContext,
        bodySnippet: document.body.innerText.replace(/\\s+/g, " ").trim().slice(0, 700),
        h1s: headings.filter((heading) => heading.level === "h1"),
        headings,
        sectionIds: [...document.querySelectorAll("[id]")].map((el) => el.id).filter(Boolean).slice(0, 80),
        controls,
        smallTouchTargets,
        forms,
        imagesMissingAlt: images.filter((img) => img.alt === null),
        brokenImages: images.filter((img) => img.visible && (!img.complete || img.naturalWidth === 0)),
        viewport: {
          innerWidth,
          innerHeight,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          scrollY: Math.round(scrollY),
        },
        hasHorizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth > 5,
        overflowDelta: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        overflowElements,
        storageKeys: {
          localStorage: Object.keys(localStorage),
          sessionStorage: Object.keys(sessionStorage),
        },
      };
    })()`);
  }

  async function collectPerformance() {
    const metrics = await cdp.send("Performance.getMetrics").catch(() => ({ metrics: [] }));
    const navigation = await evaluate(`(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource")
        .map((resource) => ({ name: resource.name.replace(/[?#].*$/, ""), initiatorType: resource.initiatorType, duration: Math.round(resource.duration), transferSize: resource.transferSize || 0 }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 12);
      if (!nav) return { resources };
      return {
        type: nav.type,
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
        loadEventMs: Math.round(nav.loadEventEnd),
        responseEndMs: Math.round(nav.responseEnd),
        transferSize: nav.transferSize || 0,
        encodedBodySize: nav.encodedBodySize || 0,
        resources,
      };
    })()`);
    return {
      metrics: Object.fromEntries((metrics.metrics || []).map((metric) => [metric.name, Number(metric.value.toFixed(3))])),
      navigation,
    };
  }

  async function capture(step, name) {
    const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const fileName = `${String(run.steps.length).padStart(2, "0")}-${name}.png`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
    step.screenshot = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
  }

  async function clearSiteStorage() {
    const origin = new URL(BASE_URL).origin;
    await cdp.send("Storage.clearDataForOrigin", { origin, storageTypes: "all" }).catch(() => null);
  }

  async function clickVisibleControlByText(text) {
    const target = await evaluate(`(() => {
      const targetText = ${jsString(text)}.toLowerCase();
      const visible = (el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      };
      const controls = [...document.querySelectorAll("a,button")].filter(visible);
      const control = controls.find((el) => (el.innerText || el.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim().toLowerCase() === targetText);
      if (!control) return { clicked: false, candidates: controls.map((el) => (el.innerText || el.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim()).filter(Boolean).slice(0, 30) };
      const rect = control.getBoundingClientRect();
      return {
        clicked: false,
        found: true,
        tag: control.tagName.toLowerCase(),
        href: control.href || null,
        text: (control.innerText || control.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim(),
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
        rect: { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) },
      };
    })()`);
    if (!target.found) return target;
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: target.x, y: target.y, button: "none" });
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: target.x, y: target.y, button: "left", clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: target.x, y: target.y, button: "left", clickCount: 1 });
    return { ...target, clicked: true };
  }

  async function getScrollContext() {
    return evaluate(`(() => {
      const sectionPositions = [...document.querySelectorAll("#home,#services,#team,#contact")]
        .map((el) => ({ id: el.id, top: Math.round(el.getBoundingClientRect().top), height: Math.round(el.getBoundingClientRect().height) }));
      const candidates = [...document.querySelectorAll("section,[id]")]
        .map((el) => ({ id: el.id || null, tag: el.tagName.toLowerCase(), text: (el.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 80), top: Math.round(el.getBoundingClientRect().top) }))
        .filter((item) => item.top >= -120 && item.top <= Math.round(innerHeight * 0.5))
        .slice(0, 8);
      return { url: location.href, scrollY: Math.round(scrollY), candidates, sectionPositions };
    })()`);
  }

  const desktop = { width: 1440, height: 900, mobile: false };
  const tablet = { width: 768, height: 1024, mobile: false };
  const mobile = { width: 390, height: 844, mobile: true };

  await clearSiteStorage();

  const home = await navigate("/", "desktop homepage first impression", desktop, 2400);
  await capture(home, "desktop-home");

  home.observations.navClicks = [];
  for (const text of ["Field Review", "Team", "Contact"]) {
    const click = await clickVisibleControlByText(text);
    await sleep(1400);
    home.observations.navClicks.push({ text, click, scrollContext: await getScrollContext() });
  }

  const about = await navigate("/about", "desktop about credibility page", desktop, 2000);
  await capture(about, "desktop-about");

  const login = await navigate("/login", "desktop investor login entry", desktop, 2200);
  login.observations.validation = await evaluate(`(() => {
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const submit = document.querySelector("button[type='submit']");
    if (!email || !password || !submit) return { available: false };
    email.focus();
    submit.click();
    return {
      available: true,
      emailRequired: email.required,
      passwordRequired: password.required,
      emailValidAfterEmptySubmit: email.validity.valid,
      emailValidationMessage: email.validationMessage,
      passwordAutocomplete: password.getAttribute("autocomplete"),
      emailAutocomplete: email.getAttribute("autocomplete"),
      stillOnLogin: location.pathname === "/login",
    };
  })()`);
  await capture(login, "desktop-login");

  const forgot = await navigate("/forgot-password", "forgot password recovery entry", desktop, 1800);
  await capture(forgot, "desktop-forgot-password");

  const reset = await navigate("/reset-password", "reset password route without token", desktop, 1800);

  for (const route of ["/dashboard", "/investor-documents", "/profile", "/admin", "/admin/reports"]) {
    await clearSiteStorage();
    const step = await navigate(route, `unauthenticated protected-route check ${route}`, desktop, 2500);
    step.observations.redirectedToLogin = step.snapshot?.pathname === "/login";
  }

  const mobileHome = await navigate("/", "mobile homepage navigation", mobile, 2400);
  mobileHome.observations.menuBefore = await evaluate(`(() => {
    const button = document.querySelector("button[aria-label='Toggle navigation menu']");
    return button ? { present: true, ariaExpanded: button.getAttribute("aria-expanded") } : { present: false };
  })()`);
  mobileHome.observations.menuClick = await evaluate(`(() => {
    const button = document.querySelector("button[aria-label='Toggle navigation menu']");
    if (!button) return { clicked: false };
    button.click();
    return { clicked: true, ariaExpandedImmediately: button.getAttribute("aria-expanded") };
  })()`);
  await sleep(900);
  mobileHome.observations.menuAfter = await collectSnapshot();
  await capture(mobileHome, "mobile-menu-open");

  const mobileLogin = await navigate("/login", "mobile investor login", mobile, 2200);
  await capture(mobileLogin, "mobile-login");

  const tabletHome = await navigate("/", "tablet homepage layout", tablet, 2000);

  run.finishedAt = new Date().toISOString();
  run.summary = buildSummary(run);

  const jsonPath = path.join(OUTPUT_DIR, "live-investor-devtools-qa.json");
  const reportPath = path.join(OUTPUT_DIR, "live-investor-devtools-qa.md");
  await writeFile(jsonPath, JSON.stringify(run, null, 2), "utf8");
  await writeFile(reportPath, renderMarkdown(run), "utf8");

  console.log(JSON.stringify({ report: path.relative(process.cwd(), reportPath), evidence: path.relative(process.cwd(), jsonPath), summary: run.summary }, null, 2));
  cdp.close();
}

function buildSummary(run) {
  const allNetworkIssues = run.steps.flatMap((step) => step.networkIssues.map((issue) => ({ step: step.label, ...issue })));
  const consoleIssues = run.steps.flatMap((step) => [
    ...step.console.map((issue) => ({ step: step.label, kind: "console", ...issue })),
    ...step.exceptions.map((issue) => ({ step: step.label, kind: "exception", ...issue })),
    ...step.logEntries.map((issue) => ({ step: step.label, kind: "log", ...issue })),
  ]);
  const protectedRouteFailures = run.steps
    .filter((step) => step.label.startsWith("unauthenticated protected-route check"))
    .filter((step) => !step.observations.redirectedToLogin)
    .map((step) => ({ route: step.pathname, finalPathname: step.snapshot?.pathname, finalUrl: step.snapshot?.url }));
  const overflowSteps = run.steps
    .filter((step) => step.snapshot?.hasHorizontalOverflow)
    .map((step) => ({ step: step.label, delta: step.snapshot.overflowDelta, viewport: step.viewport }));
  const brokenImageSteps = run.steps
    .filter((step) => step.snapshot?.brokenImages?.length)
    .map((step) => ({ step: step.label, count: step.snapshot.brokenImages.length }));
  const missingAltSteps = run.steps
    .filter((step) => step.snapshot?.imagesMissingAlt?.length)
    .map((step) => ({ step: step.label, count: step.snapshot.imagesMissingAlt.length }));
  const smallTouchTargetSteps = run.steps
    .filter((step) => step.viewport.width <= 768 && step.snapshot?.smallTouchTargets?.length)
    .map((step) => ({
      step: step.label,
      count: step.snapshot.smallTouchTargets.length,
      examples: step.snapshot.smallTouchTargets.slice(0, 5).map((control) => ({
        text: control.text,
        tag: control.tag,
        width: control.rect.width,
        height: control.rect.height,
      })),
    }));

  return {
    totalSteps: run.steps.length,
    consoleIssueCount: consoleIssues.length,
    networkIssueCount: allNetworkIssues.length,
    protectedRouteFailures,
    overflowSteps,
    brokenImageSteps,
    missingAltSteps,
    smallTouchTargetSteps,
  };
}

function renderMarkdown(run) {
  const lines = [];
  lines.push("# Live Investor Chrome DevTools QA");
  lines.push("");
  lines.push(`Target: ${run.baseUrl}`);
  lines.push(`Started: ${run.startedAt}`);
  lines.push(`Finished: ${run.finishedAt}`);
  lines.push(`Chrome target: ${run.chromeTarget.title || "Untitled"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Steps executed: ${run.summary.totalSteps}`);
  lines.push(`- Console/log/exception issues captured: ${run.summary.consoleIssueCount}`);
  lines.push(`- Network issues captured: ${run.summary.networkIssueCount}`);
  lines.push(`- Protected route redirect failures: ${run.summary.protectedRouteFailures.length}`);
  lines.push(`- Horizontal overflow steps: ${run.summary.overflowSteps.length}`);
  lines.push(`- Broken image steps: ${run.summary.brokenImageSteps.length}`);
  lines.push(`- Image missing-alt steps: ${run.summary.missingAltSteps.length}`);
  lines.push(`- Mobile/tablet small touch-target steps: ${run.summary.smallTouchTargetSteps.length}`);
  lines.push("");
  lines.push("## Findings");
  lines.push("");

  if (run.summary.protectedRouteFailures.length) {
    lines.push("### High: Protected routes did not consistently redirect unauthenticated users");
    for (const failure of run.summary.protectedRouteFailures) {
      lines.push(`- ${failure.route} ended at ${failure.finalUrl}`);
    }
    lines.push("");
  }

  if (run.summary.consoleIssueCount) {
    lines.push("### Medium: DevTools console/log issues need review");
    for (const step of run.steps) {
      const issues = [...step.console, ...step.exceptions, ...step.logEntries];
      if (!issues.length) continue;
      lines.push(`- ${step.label}: ${issues.length} issue(s)`);
      for (const issue of issues.slice(0, 6)) {
        lines.push(`- ${issue.type || issue.level || issue.kind || "issue"}: ${(issue.text || issue.description || "").replace(/\s+/g, " ").slice(0, 220)}`);
      }
    }
    lines.push("");
  }

  if (run.summary.networkIssueCount) {
    lines.push("### Medium: Network failures/status errors were captured");
    const networkIssues = run.steps.flatMap((step) => step.networkIssues.map((issue) => ({ step: step.label, ...issue })));
    for (const issue of networkIssues.slice(0, 20)) {
      lines.push(`- ${issue.step}: ${issue.kind} ${issue.status || issue.errorText || ""} ${issue.url || issue.requestId || ""}`.trim());
    }
    if (networkIssues.length > 20) lines.push(`- ${networkIssues.length - 20} additional network issue(s) in JSON evidence.`);
    lines.push("");
  }

  if (run.summary.overflowSteps.length) {
    lines.push("### Medium: Responsive horizontal overflow detected");
    for (const item of run.summary.overflowSteps) {
      lines.push(`- ${item.step}: overflow delta ${item.delta}px at ${item.viewport.width}x${item.viewport.height}`);
    }
    lines.push("");
  }

  if (!run.summary.protectedRouteFailures.length && !run.summary.consoleIssueCount && !run.summary.networkIssueCount && !run.summary.overflowSteps.length) {
    lines.push("- No high/medium issues were detected by the automated DevTools pass.");
    lines.push("");
  }

  if (run.summary.smallTouchTargetSteps.length) {
    lines.push("### Low: Some secondary mobile/tablet targets are below 44px high");
    for (const item of run.summary.smallTouchTargetSteps) {
      lines.push(`- ${item.step}: ${item.count} sampled target(s) below 44px.`);
      for (const example of item.examples) {
        lines.push(`- Example: ${example.tag} \"${example.text}\" is ${example.width}x${example.height}px.`);
      }
    }
    lines.push("");
  }

  lines.push("## Human-Investor Flow Notes");
  lines.push("");
  for (const step of run.steps) {
    const snapshot = step.snapshot || {};
    lines.push(`### ${step.label}`);
    lines.push(`- Final URL: ${snapshot.url || "unknown"}`);
    lines.push(`- Title: ${snapshot.title || "unknown"}`);
    lines.push(`- H1: ${(snapshot.h1s || []).map((heading) => heading.text).join(" | ") || "none detected"}`);
    lines.push(`- Viewport: ${step.viewport.width}x${step.viewport.height}${step.viewport.mobile ? " mobile" : ""}`);
    lines.push(`- Horizontal overflow: ${snapshot.hasHorizontalOverflow ? `yes (${snapshot.overflowDelta}px)` : "no"}`);
    lines.push(`- Visible controls sampled: ${(snapshot.controls || []).length}`);
    lines.push(`- Forms: ${(snapshot.forms || []).length}`);
    lines.push(`- Broken visible images: ${(snapshot.brokenImages || []).length}`);
    lines.push(`- Missing image alt attributes: ${(snapshot.imagesMissingAlt || []).length}`);
    if (step.screenshot) lines.push(`- Screenshot: ${step.screenshot}`);
    if (step.observations.redirectedToLogin !== undefined) lines.push(`- Redirected to login: ${step.observations.redirectedToLogin}`);
    if (step.observations.validation) {
      lines.push(`- Login validation: ${JSON.stringify(step.observations.validation)}`);
    }
    if (step.observations.navClicks?.length) {
      for (const nav of step.observations.navClicks) {
        lines.push(`- Nav click ${nav.text}: clicked=${nav.click.clicked}, scrollY=${nav.scrollContext.scrollY}, nearby=${nav.scrollContext.candidates.map((candidate) => candidate.id || candidate.text || candidate.tag).join(" / ")}`);
      }
    }
    if (step.observations.menuAfter) {
      lines.push(`- Mobile menu visible controls after open: ${step.observations.menuAfter.controls.length}`);
    }
    lines.push("");
  }

  lines.push("## Credential-Dependent Coverage Gap");
  lines.push("");
  lines.push("- I did not submit real investor credentials or create production auth activity. Provide a safe test investor account to complete dashboard, document preview/download, profile, logout, and post-logout cache checks.");
  lines.push("");
  lines.push("## Evidence Files");
  lines.push("");
  lines.push(`- JSON evidence: ${path.relative(process.cwd(), path.join(OUTPUT_DIR, "live-investor-devtools-qa.json")).replace(/\\/g, "/")}`);
  lines.push(`- Screenshots directory: ${path.relative(process.cwd(), OUTPUT_DIR).replace(/\\/g, "/")}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
