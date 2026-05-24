import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("framer-motion", () => ({
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockHandleSignNda = vi.fn();
const mockHandleDocumentAccess = vi.fn();
const mockRetryLoad = vi.fn();

vi.mock("@/hooks/useInvestorDocuments", () => ({
  useInvestorDocuments: vi.fn(() => ({
    user: { id: "user-1", email: "test@example.com" },
    ndaStatus: null,
        documents: [],
        loading: false,
        loadError: null,
        accessLoadingId: null,
        retryLoad: mockRetryLoad,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        getDocumentAccessUrl: vi.fn(),
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      })),
}));

import { DocumentsTab } from "@/components/dashboard/DocumentsTab";
import { useInvestorDocuments } from "@/hooks/useInvestorDocuments";

describe("DocumentsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should render loading skeleton when loading", () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: null,
        documents: [],
        loading: true,
        loadError: null,
        accessLoadingId: null,
        retryLoad: mockRetryLoad,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        getDocumentAccessUrl: vi.fn(),
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      const loadingSkeleton = document.querySelector(".animate-pulse");
      expect(loadingSkeleton).toBeInTheDocument();
    });
  });

  describe("Access Pending State", () => {
    it("should render generic access pending view when access is not active", () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: { nda_signed: false, nda_signed_at: null },
        documents: [],
        loading: false,
        loadError: null,
        accessLoadingId: null,
        retryLoad: mockRetryLoad,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        getDocumentAccessUrl: vi.fn(),
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      expect(screen.getByText(/Deal Room Access Pending/i)).toBeInTheDocument();
    });

    it("should call retryLoad when refresh access is clicked", async () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: { nda_signed: false, nda_signed_at: null },
        documents: [],
        loading: false,
        loadError: null,
        accessLoadingId: null,
        retryLoad: mockRetryLoad,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        getDocumentAccessUrl: vi.fn(),
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      const refreshButton = screen.getByRole("button", { name: /Refresh Access/i });
      fireEvent.click(refreshButton);
      expect(mockRetryLoad).toHaveBeenCalledTimes(1);
    });
  });

  describe("NDA Signed State", () => {
    it("should render documents list when NDA is signed", () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: { nda_signed: true, nda_signed_at: "2024-01-01T00:00:00Z" },
        documents: [{
          id: "doc-1",
          title: "Deal Snapshot",
          description: "Start here",
          created_at: "2024-01-01",
          category: "pitch",
          asset_type: "document",
          file_size: 1024,
          mime_type: "application/pdf",
          original_filename: "snapshot.pdf",
          thumbnail_path: null,
          sort_order: 0,
          is_featured: true,
        }],
        loading: false,
        loadError: null,
        accessLoadingId: null,
        retryLoad: mockRetryLoad,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        getDocumentAccessUrl: vi.fn(),
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      expect(screen.getByText(/Deal Room Unlocked/i)).toBeInTheDocument();
      expect(screen.getByText(/Deal Snapshot/i)).toBeInTheDocument();
    });

    it("should show empty state when no documents assigned", () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: { nda_signed: true, nda_signed_at: "2024-01-01" },
        documents: [],
        loading: false,
        loadError: null,
        accessLoadingId: null,
        retryLoad: mockRetryLoad,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        getDocumentAccessUrl: vi.fn(),
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      expect(screen.getByText(/No assets assigned yet/i)).toBeInTheDocument();
    });
  });
});
