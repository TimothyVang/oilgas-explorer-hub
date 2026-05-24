import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.QA_URL || "http://127.0.0.1:4173";
const CDP_ENDPOINT = process.env.CDP_ENDPOINT || "http://localhost:9222";
const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");
const OUTPUT_DIR = path.resolve("qa", "evidence", RUN_ID);
const IS_PRODUCTION_TARGET = /^https:\/\/(www\.)?bah-oil-gas\.com\/?/i.test(BASE_URL);
const CAPTURE_SCREENSHOTS = process.env.QA_CAPTURE_SCREENSHOTS === "1" && (!IS_PRODUCTION_TARGET || process.env.QA_ALLOW_PRODUCTION_SCREENSHOTS === "1");

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
        if (message.error) reject(new Error(`${message.error.message || "CDP command failed"}: ${JSON.stringify(message.error)}`));
        else resolve(message.result || {});
        return;
      }

      const handlers = this.handlers.get(message.method);
      if (handlers) for (const handler of handlers) handler(message.params || {});
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
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out running ${method}`));
      }, timeout);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws?.close();
  }
}

async function getPageTarget() {
  const targets = await fetch(`${CDP_ENDPOINT}/json/list`).then((response) => response.json());
  const pages = targets.filter((target) => target.type === "page");
  const targetHost = new URL(BASE_URL).host;
  return pages.find((target) => target.url.includes(targetHost) && !target.url.includes("devtools")) || pages[0];
}

async function getSanitizedTabs() {
  const targets = await fetch(`${CDP_ENDPOINT}/json/list`).then((response) => response.json());
  return targets
    .filter((target) => target.type === "page")
    .map((target) => ({
      id: target.id,
      title: redactText(target.title),
      url: sanitizeUrl(target.url),
    }));
}

function assertTargetAllowed() {
  if (IS_PRODUCTION_TARGET && process.env.QA_ALLOW_PRODUCTION !== "1") {
    throw new Error("Refusing authenticated production QA without QA_ALLOW_PRODUCTION=1. Use QA_URL for local/staging, or explicitly opt into production.");
  }
}

function sanitizeUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  try {
    const url = new URL(rawUrl);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return String(rawUrl).replace(/[?#].*$/, "");
  }
}

function redactText(value) {
  return String(value || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/token=[^\s&]+/gi, "token=[redacted]")
    .replace(/eyJ[a-zA-Z0-9._-]+/g, "[redacted-token]");
}

function isSupabaseUrl(url) {
  return /supabase\.co|\/auth\/v1|\/rest\/v1|\/storage\/v1|\/functions\/v1/.test(url || "");
}

async function main() {
  assertTargetAllowed();
  await mkdir(OUTPUT_DIR, { recursive: true });
  const target = await getPageTarget();
  if (!target) throw new Error("No Chrome page target found. Launch visible Chrome with --remote-debugging-port=9222 first.");

  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  const run = {
    baseUrl: BASE_URL,
    startedAt: new Date().toISOString(),
    chromeTarget: { id: target.id, initialUrl: sanitizeUrl(target.url), title: redactText(target.title) },
    screenshotsEnabled: CAPTURE_SCREENSHOTS,
    steps: [],
  };

  let activeStep = null;
  const requestMap = new Map();

  cdp.on("Runtime.consoleAPICalled", (params) => {
    if (!activeStep || !["error", "warning", "assert"].includes(params.type)) return;
    activeStep.console.push({
      type: params.type,
      text: redactText(params.args?.map((arg) => arg.value || arg.description || arg.type).join(" ")).slice(0, 1000),
    });
  });

  cdp.on("Runtime.exceptionThrown", (params) => {
    if (!activeStep) return;
    activeStep.exceptions.push({
      text: params.exceptionDetails?.text,
      description: redactText(params.exceptionDetails?.exception?.description),
      lineNumber: params.exceptionDetails?.lineNumber,
      columnNumber: params.exceptionDetails?.columnNumber,
    });
  });

  cdp.on("Network.requestWillBeSent", (params) => {
    requestMap.set(params.requestId, {
      url: params.request.url,
      method: params.request.method,
      type: params.type,
    });
  });

  cdp.on("Network.responseReceived", (params) => {
    if (!activeStep) return;
    const request = requestMap.get(params.requestId) || {};
    const url = params.response?.url || request.url;
    const status = params.response?.status || 0;
    if (isSupabaseUrl(url)) {
      activeStep.supabaseRequests.push({
        method: request.method || "GET",
        status,
        type: params.type,
        url: sanitizeUrl(url),
      });
    }
    if (status >= 400) {
      activeStep.networkIssues.push({ kind: "http-status", status, type: params.type, url: sanitizeUrl(url) });
    }
  });

  cdp.on("Network.loadingFailed", (params) => {
    if (!activeStep) return;
    const request = requestMap.get(params.requestId) || {};
    activeStep.networkIssues.push({
      kind: "loading-failed",
      errorText: params.errorText,
      type: params.type,
      url: sanitizeUrl(request.url),
    });
  });

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Performance.enable");

  async function evaluate(expression, awaitPromise = false) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      awaitPromise,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      return { evaluationError: result.exceptionDetails.exception?.description || result.exceptionDetails.text };
    }
    return result.result?.value;
  }

  async function navigate(pathname, label, waitMs = 2600) {
    activeStep = {
      label,
      pathname,
      startedAt: new Date().toISOString(),
      console: [],
      exceptions: [],
      networkIssues: [],
      supabaseRequests: [],
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
      const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();
      const controls = [...document.querySelectorAll("a,button,input,select,textarea,[role='button'],[tabindex]")]
        .filter(visible)
        .slice(0, 140)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            type: el.getAttribute("type"),
            text: cleanText(el.getAttribute("aria-label") || el.innerText || el.placeholder || el.getAttribute("title")).slice(0, 140),
            href: el.href ? el.href.replace(/[?#].*$/, "") : null,
            disabled: Boolean(el.disabled),
            rect: { width: Math.round(rect.width), height: Math.round(rect.height), x: Math.round(rect.x), y: Math.round(rect.y) },
          };
        });
      const headings = [...document.querySelectorAll("h1,h2,h3")].slice(0, 50).map((el) => ({ level: el.tagName.toLowerCase(), text: cleanText(el.innerText).slice(0, 180) }));
      const storageKeys = {
        localStorage: Object.keys(localStorage).map((key) => key.includes("auth-token") || key.includes("supabase") ? "[supabase-auth-key]" : key),
        sessionStorage: Object.keys(sessionStorage).map((key) => key.includes("auth-token") || key.includes("supabase") ? "[supabase-auth-key]" : key),
      };
      return {
        url: location.href.replace(/[?#].*$/, ""),
        pathname: location.pathname,
        title: document.title,
        readyState: document.readyState,
        h1s: headings.filter((heading) => heading.level === "h1"),
        headings,
        bodySnippet: "[redacted-authenticated-content]",
        controls,
        storageKeys,
        hasSupabaseAuthStorage: Object.keys(localStorage).some((key) => key.includes("auth-token") || key.includes("supabase")) || Object.keys(sessionStorage).some((key) => key.includes("auth-token") || key.includes("supabase")),
        hasHorizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth > 5,
        overflowDelta: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        visibleErrorText: [...document.querySelectorAll("[role='alert'],.text-red-500,.text-destructive")].filter(visible).map((el) => cleanText(el.innerText)).filter(Boolean).slice(0, 20),
      };
    })()`);
  }

  async function collectPerformance() {
    return evaluate(`(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource")
        .filter((resource) => /supabase\.co|\/auth\/v1|\/rest\/v1|\/storage\/v1|\/functions\/v1/.test(resource.name))
        .map((resource) => ({ name: resource.name.replace(/[?#].*$/, ""), initiatorType: resource.initiatorType, duration: Math.round(resource.duration), transferSize: resource.transferSize || 0 }))
        .slice(-30);
      return {
        domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
        loadEventMs: nav ? Math.round(nav.loadEventEnd) : null,
        supabaseResources: resources,
      };
    })()`);
  }

  async function capture(step, name) {
    if (!CAPTURE_SCREENSHOTS) return;
    const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const fileName = `${String(run.steps.length).padStart(2, "0")}-${name}.png`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
    step.screenshot = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
  }

  async function clickByText(text, waitMs = 1200) {
    const result = await evaluate(`(() => {
      const targetText = ${JSON.stringify(text)}.toLowerCase();
      const visible = (el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      };
      const control = [...document.querySelectorAll("button,a,[role='tab'],[role='button']")]
        .filter(visible)
        .find((el) => (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().toLowerCase().includes(targetText));
      if (!control) return { clicked: false };
      control.click();
      return { clicked: true, text: (control.innerText || control.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 120) };
    })()`);
    await sleep(waitMs);
    return result;
  }

  const current = await navigate("/dashboard", "authenticated dashboard landing", 3600);
  current.observations.authenticated = current.snapshot?.pathname !== "/login";
  await capture(current, "auth-dashboard");

  const documentsTabClick = await clickByText("Deal Room", 2000);
  current.observations.dealRoomClick = documentsTabClick;
  current.observations.afterDealRoom = await collectSnapshot();
  await capture(current, "auth-dashboard-deal-room");

  const investorDocuments = await navigate("/investor-documents", "investor documents route", 3800);
  await capture(investorDocuments, "auth-investor-documents");
  investorDocuments.observations.documentControls = investorDocuments.snapshot.controls
    .filter((control) => /view|download|preview|open|document|video|image|deck|model|summary/i.test(control.text))
    .slice(0, 25);
  investorDocuments.observations.assetAccessClick = await clickByText("Play Video", 4200);
  investorDocuments.observations.afterAssetAccess = await collectSnapshot();
  investorDocuments.observations.tabsAfterAssetAccess = await getSanitizedTabs();
  investorDocuments.observations.assetAccessFunctionSucceeded = investorDocuments.supabaseRequests
    .some((request) => request.method !== "OPTIONS" && request.url.includes("/functions/v1/create-asset-access-url") && request.status >= 200 && request.status < 300);
  investorDocuments.observations.activityLoggedAfterAssetAccess = investorDocuments.supabaseRequests
    .some((request) => request.url.includes("/rest/v1/activity_logs") && request.status >= 200 && request.status < 300);

  const profile = await navigate("/profile", "investor profile route", 3000);
  await capture(profile, "auth-profile");

  const admin = await navigate("/admin", "investor admin denial route", 3200);
  admin.observations.redirectedAwayFromAdmin = admin.snapshot?.pathname !== "/admin";

  const adminReports = await navigate("/admin/reports", "investor admin reports denial route", 3200);
  adminReports.observations.redirectedAwayFromAdminReports = adminReports.snapshot?.pathname !== "/admin/reports";

  const logoutStep = await navigate("/dashboard", "logout availability check", 2200);
  logoutStep.observations.logoutControl = logoutStep.snapshot.controls.find((control) => /logout|sign out/i.test(control.text)) || null;

  run.finishedAt = new Date().toISOString();
  run.summary = buildSummary(run);

  const jsonPath = path.join(OUTPUT_DIR, "authenticated-investor-devtools-qa.json");
  const reportPath = path.join(OUTPUT_DIR, "authenticated-investor-devtools-qa.md");
  await writeFile(jsonPath, JSON.stringify(run, null, 2), "utf8");
  await writeFile(reportPath, renderMarkdown(run), "utf8");

  console.log(JSON.stringify({ report: path.relative(process.cwd(), reportPath), evidence: path.relative(process.cwd(), jsonPath), summary: run.summary }, null, 2));
  cdp.close();
}

function buildSummary(run) {
  const consoleIssues = run.steps.flatMap((step) => [...step.console, ...step.exceptions]);
  const networkIssues = run.steps.flatMap((step) => step.networkIssues.map((issue) => ({ step: step.label, ...issue })));
  const supabaseRequests = run.steps.flatMap((step) => step.supabaseRequests.map((request) => ({ step: step.label, ...request })));
  const supabaseErrors = supabaseRequests.filter((request) => request.status >= 400);
  const supabaseTransportFailures = run.steps.flatMap((step) => step.networkIssues.filter((issue) => isSupabaseUrl(issue.url)));
  const assetAccessStep = run.steps.find((step) => step.label === "investor documents route");
  const authFailures = run.steps.filter((step) => ["authenticated dashboard landing", "investor documents route", "investor profile route"].includes(step.label) && step.snapshot?.pathname === "/login");
  const adminFailures = run.steps.filter((step) => step.label.includes("admin") && step.snapshot?.pathname.startsWith("/admin"));

  return {
    totalSteps: run.steps.length,
    consoleIssueCount: consoleIssues.length,
    networkIssueCount: networkIssues.length,
    supabaseRequestCount: supabaseRequests.length,
    supabaseErrorCount: supabaseErrors.length,
    supabaseTransportFailureCount: supabaseTransportFailures.length,
    authFailures: authFailures.map((step) => step.label),
    adminRouteFailures: adminFailures.map((step) => ({ label: step.label, pathname: step.snapshot?.pathname })),
    sawSupabaseAuthStorage: run.steps.some((step) => step.snapshot?.hasSupabaseAuthStorage),
    dashboardLoaded: run.steps.some((step) => step.label === "authenticated dashboard landing" && step.snapshot?.pathname === "/dashboard"),
    investorDocumentsLoaded: run.steps.some((step) => step.label === "investor documents route" && step.snapshot?.pathname === "/investor-documents"),
    profileLoaded: run.steps.some((step) => step.label === "investor profile route" && step.snapshot?.pathname === "/profile"),
    assetAccessClicked: Boolean(assetAccessStep?.observations.assetAccessClick?.clicked),
    assetAccessFunctionSucceeded: Boolean(assetAccessStep?.supabaseRequests.some((request) => request.method !== "OPTIONS" && request.url.includes("/functions/v1/create-asset-access-url") && request.status >= 200 && request.status < 300)),
    activityLoggedAfterAssetAccess: Boolean(assetAccessStep?.observations.activityLoggedAfterAssetAccess),
  };
}

function renderMarkdown(run) {
  const lines = [];
  lines.push("# Authenticated Investor Chrome DevTools QA");
  lines.push("");
  lines.push(`Target: ${run.baseUrl}`);
  lines.push(`Started: ${run.startedAt}`);
  lines.push(`Finished: ${run.finishedAt}`);
  lines.push("Credentials: not recorded");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Steps executed: ${run.summary.totalSteps}`);
  lines.push(`- Console/exception issues captured: ${run.summary.consoleIssueCount}`);
  lines.push(`- Network issues captured: ${run.summary.networkIssueCount}`);
  lines.push(`- Supabase/API requests observed: ${run.summary.supabaseRequestCount}`);
  lines.push(`- Supabase/API errors observed: ${run.summary.supabaseErrorCount}`);
  lines.push(`- Supabase/API transport failures observed: ${run.summary.supabaseTransportFailureCount}`);
  lines.push(`- Supabase auth storage key observed: ${run.summary.sawSupabaseAuthStorage}`);
  lines.push(`- Dashboard loaded: ${run.summary.dashboardLoaded}`);
  lines.push(`- Investor documents loaded: ${run.summary.investorDocumentsLoaded}`);
  lines.push(`- Profile loaded: ${run.summary.profileLoaded}`);
  lines.push(`- Featured asset action clicked: ${run.summary.assetAccessClicked}`);
  lines.push(`- Asset access Edge Function succeeded: ${run.summary.assetAccessFunctionSucceeded}`);
  lines.push(`- Asset access activity log observed: ${run.summary.activityLoggedAfterAssetAccess}`);
  lines.push(`- Admin route failures: ${run.summary.adminRouteFailures.length}`);
  lines.push("");
  lines.push("## Findings");
  lines.push("");

  if (!run.summary.dashboardLoaded || !run.summary.investorDocumentsLoaded || !run.summary.profileLoaded) {
    lines.push("### High: Authenticated investor route failed to load");
    for (const failure of run.summary.authFailures) lines.push(`- ${failure}`);
    lines.push("");
  }

  if (run.summary.adminRouteFailures.length) {
    lines.push("### High: Investor could access an admin route");
    for (const failure of run.summary.adminRouteFailures) lines.push(`- ${failure.label} ended at ${failure.pathname}`);
    lines.push("");
  }

  if (run.summary.supabaseErrorCount) {
    lines.push("### Medium: Supabase/API errors were observed");
    for (const step of run.steps) {
      const errors = step.supabaseRequests.filter((request) => request.status >= 400);
      if (!errors.length) continue;
      lines.push(`- ${step.label}: ${errors.map((request) => `${request.status} ${request.url}`).join("; ")}`);
    }
    lines.push("");
  }

  if (run.summary.assetAccessClicked && !run.summary.assetAccessFunctionSucceeded) {
    lines.push("### Medium: Featured asset action did not produce a successful signed-URL function call");
    lines.push("- The investor Deal Room loaded, but the secure asset access path did not show a successful `create-asset-access-url` response.");
    lines.push("");
  }

  if (run.summary.consoleIssueCount) {
    lines.push("### Medium: Console or runtime issues were observed");
    for (const step of run.steps) {
      const issues = [...step.console, ...step.exceptions];
      if (!issues.length) continue;
      lines.push(`- ${step.label}: ${issues.length} issue(s)`);
      for (const issue of issues.slice(0, 5)) lines.push(`- ${(issue.type || "exception")}: ${(issue.text || issue.description || "").replace(/\s+/g, " ").slice(0, 220)}`);
    }
    lines.push("");
  }

  if (run.summary.dashboardLoaded && run.summary.investorDocumentsLoaded && run.summary.profileLoaded && run.summary.assetAccessFunctionSucceeded && !run.summary.adminRouteFailures.length && !run.summary.supabaseErrorCount && !run.summary.consoleIssueCount) {
    lines.push("- No high/medium issues were detected in the authenticated investor pass.");
    lines.push("");
  }

  lines.push("## Route Notes");
  lines.push("");
  for (const step of run.steps) {
    lines.push(`### ${step.label}`);
    lines.push(`- Final URL: ${step.snapshot?.url || "unknown"}`);
    lines.push(`- Path: ${step.snapshot?.pathname || "unknown"}`);
    lines.push(`- H1: ${(step.snapshot?.h1s || []).map((heading) => heading.text).join(" | ") || "none detected"}`);
    lines.push(`- Supabase/API requests: ${step.supabaseRequests.length}`);
    lines.push(`- Network issues: ${step.networkIssues.length}`);
    lines.push(`- Console/exception issues: ${step.console.length + step.exceptions.length}`);
    lines.push(`- Visible errors: ${(step.snapshot?.visibleErrorText || []).join(" | ") || "none"}`);
    if (step.screenshot) lines.push(`- Screenshot: ${step.screenshot}`);
    if (step.observations.documentControls) lines.push(`- Document controls sampled: ${step.observations.documentControls.map((control) => control.text).filter(Boolean).join(" | ") || "none"}`);
    if (step.observations.assetAccessClick) lines.push(`- Featured asset action clicked: ${step.observations.assetAccessClick.clicked}`);
    if (step.observations.assetAccessFunctionSucceeded !== undefined) lines.push(`- Asset access function succeeded: ${step.observations.assetAccessFunctionSucceeded}`);
    if (step.observations.activityLoggedAfterAssetAccess !== undefined) lines.push(`- Activity log observed after asset access: ${step.observations.activityLoggedAfterAssetAccess}`);
    if (step.observations.tabsAfterAssetAccess) lines.push(`- Tabs after asset access: ${step.observations.tabsAfterAssetAccess.map((tab) => tab.url).join(" | ")}`);
    if (step.observations.logoutControl !== undefined) lines.push(`- Logout control visible: ${Boolean(step.observations.logoutControl)}`);
    lines.push("");
  }

  lines.push("## Supabase/API Requests Observed");
  lines.push("");
  const requests = run.steps.flatMap((step) => step.supabaseRequests.map((request) => ({ step: step.label, ...request })));
  for (const request of requests.slice(0, 80)) {
    lines.push(`- ${request.step}: ${request.method} ${request.status} ${request.url}`);
  }
  if (requests.length > 80) lines.push(`- ${requests.length - 80} additional request(s) in JSON evidence.`);
  lines.push("");
  lines.push("## Evidence Files");
  lines.push("");
  lines.push(`- JSON evidence: ${path.relative(process.cwd(), path.join(OUTPUT_DIR, "authenticated-investor-devtools-qa.json")).replace(/\\/g, "/")}`);
  lines.push(`- Screenshots directory: ${path.relative(process.cwd(), OUTPUT_DIR).replace(/\\/g, "/")}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
