import type { Session, User } from "@supabase/supabase-js";

export const DEMO_INVESTOR_USERNAME = "investor";
export const DEMO_INVESTOR_EMAIL = "investor@bahoil.demo";
export const DEMO_INVESTOR_PASSWORD = "BAHdemo2026!";
export const DEMO_INVESTOR_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_SESSION_STORAGE_KEY = "bah_investor_demo_session";

type DemoUserLike = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
} | null | undefined;

export interface DemoInvestorDocument {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  category: "overview" | "pitch" | "financials" | "mapping" | "operations" | "field_videos" | "management";
  asset_type: "document" | "video" | "image";
  file_size: number | null;
  mime_type: string | null;
  original_filename: string | null;
  thumbnail_path: string | null;
  sort_order: number;
  is_featured: boolean;
}

export const demoInvestorDocuments: DemoInvestorDocument[] = [
  {
    id: "demo-start-here",
    title: "Start Here: Investor Review Path",
    description: "A plain-English orientation for how approved investors should review the private deck, financial model, mapping support, field evidence, and management materials.",
    created_at: "2026-05-24T00:00:00Z",
    category: "overview",
    asset_type: "document",
    file_size: 92 * 1024,
    mime_type: "application/pdf",
    original_filename: "Pitch Deck Word Version.pdf",
    thumbnail_path: null,
    sort_order: 1,
    is_featured: true,
  },
  {
    id: "demo-deal-snapshot",
    title: "Opportunity Snapshot",
    description: "Concise investor snapshot covering structure, review sequence, and core private materials staged for the BAH deal room.",
    created_at: "2026-05-24T00:00:00Z",
    category: "pitch",
    asset_type: "document",
    file_size: 75 * 1024,
    mime_type: "application/pdf",
    original_filename: "BAH Oil - Opportunity Snapshot.pdf",
    thumbnail_path: null,
    sort_order: 1,
    is_featured: false,
  },
  {
    id: "demo-pitch-deck",
    title: "Investor Overview Deck",
    description: "Primary investor deck preview slot. Final PDF/PPTX delivery will use Supabase private storage and signed URLs.",
    created_at: "2026-05-24T00:00:00Z",
    category: "pitch",
    asset_type: "document",
    file_size: 1.8 * 1024 * 1024,
    mime_type: "application/pdf",
    original_filename: "BAH Oil - Investor Overview Deck.pdf",
    thumbnail_path: null,
    sort_order: 2,
    is_featured: false,
  },
  {
    id: "demo-afe",
    title: "Budget Support",
    description: "Spreadsheet slot for project cost detail, capital-call support, and staged expenditure review.",
    created_at: "2026-05-24T00:00:00Z",
    category: "financials",
    asset_type: "document",
    file_size: 34 * 1024,
    mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    original_filename: "Budget Support.xlsx",
    thumbnail_path: null,
    sort_order: 1,
    is_featured: false,
  },
  {
    id: "demo-pro-forma",
    title: "Financial Review Model",
    description: "Locked-cell model slot for investor economics, assumptions, distribution review, and tax-framing discussion.",
    created_at: "2026-05-24T00:00:00Z",
    category: "financials",
    asset_type: "document",
    file_size: 191 * 1024,
    mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    original_filename: "Financial Review Model.xlsx",
    thumbnail_path: null,
    sort_order: 2,
    is_featured: false,
  },
  {
    id: "demo-economic-summary",
    title: "Financial Summary",
    description: "One-page reference slot for the quick financial summary investors can review before opening the full model.",
    created_at: "2026-05-24T00:00:00Z",
    category: "financials",
    asset_type: "document",
    file_size: 6 * 1024,
    mime_type: "application/pdf",
    original_filename: "Financial Summary.pdf",
    thumbnail_path: null,
    sort_order: 3,
    is_featured: false,
  },
  {
    id: "demo-mapping-deck",
    title: "Technical Mapping Deck",
    description: "Technical appendix slot for subsurface mapping support and geologic review materials.",
    created_at: "2026-05-24T00:00:00Z",
    category: "mapping",
    asset_type: "document",
    file_size: 2 * 1024 * 1024,
    mime_type: "application/pdf",
    original_filename: "Technical Mapping Deck.pdf",
    thumbnail_path: null,
    sort_order: 1,
    is_featured: false,
  },
  {
    id: "demo-operations-sequence",
    title: "Operations Field Sequence",
    description: "Compressed portal video slot for operations context, site activity, and tangible field evidence.",
    created_at: "2026-05-24T00:00:00Z",
    category: "operations",
    asset_type: "video",
    file_size: 28 * 1024 * 1024,
    mime_type: "video/mp4",
    original_filename: "operations-field-sequence.mp4",
    thumbnail_path: null,
    sort_order: 1,
    is_featured: false,
  },
  {
    id: "demo-field-video",
    title: "Short Field Clip",
    description: "Fast-loading video card slot for a short operational clip after compression and sensitivity review.",
    created_at: "2026-05-24T00:00:00Z",
    category: "field_videos",
    asset_type: "video",
    file_size: 8 * 1024 * 1024,
    mime_type: "video/mp4",
    original_filename: "field-clip-short.mp4",
    thumbnail_path: null,
    sort_order: 1,
    is_featured: false,
  },
  {
    id: "demo-management-cv",
    title: "Technical Leadership CV",
    description: "Management and technical authority slot for the engineering/geology credentials packet.",
    created_at: "2026-05-24T00:00:00Z",
    category: "management",
    asset_type: "document",
    file_size: 221 * 1024,
    mime_type: "application/pdf",
    original_filename: "Technical Advisor Background.pdf",
    thumbnail_path: null,
    sort_order: 1,
    is_featured: false,
  },
];

export const isDemoLogin = (identifier: string, password: string) => {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  return (
    password === DEMO_INVESTOR_PASSWORD &&
    (normalizedIdentifier === DEMO_INVESTOR_USERNAME || normalizedIdentifier === DEMO_INVESTOR_EMAIL)
  );
};

export const isDemoInvestorUser = (user: DemoUserLike) => {
  return Boolean(
    user?.id === DEMO_INVESTOR_ID ||
    user?.email === DEMO_INVESTOR_EMAIL ||
    user?.user_metadata?.demo_user === true,
  );
};

export const hasStoredDemoSession = () => {
  return typeof window !== "undefined" && window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY) === "active";
};

export const storeDemoSession = () => {
  if (typeof window !== "undefined") window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, "active");
};

export const clearDemoSession = () => {
  if (typeof window !== "undefined") window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
};

export const createDemoUser = (): User => ({
  id: DEMO_INVESTOR_ID,
  aud: "authenticated",
  role: "authenticated",
  email: DEMO_INVESTOR_EMAIL,
  email_confirmed_at: "2026-05-24T00:00:00Z",
  phone: "",
  confirmed_at: "2026-05-24T00:00:00Z",
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: "demo", providers: ["demo"] },
  user_metadata: {
    full_name: "BAH Investor Demo",
    role: "investor",
    demo_user: true,
  },
  identities: [],
  created_at: "2026-05-24T00:00:00Z",
  updated_at: new Date().toISOString(),
} as User);

export const createDemoSession = (): Session => ({
  access_token: "demo-investor-access-token",
  refresh_token: "demo-investor-refresh-token",
  expires_in: 24 * 60 * 60,
  expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  token_type: "bearer",
  user: createDemoUser(),
} as Session);
