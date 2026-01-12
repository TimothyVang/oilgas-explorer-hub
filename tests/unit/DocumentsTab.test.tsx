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

vi.mock("@/hooks/useInvestorDocuments", () => ({
  useInvestorDocuments: vi.fn(() => ({
    user: { id: "user-1", email: "test@example.com" },
    ndaStatus: null,
    documents: [],
    loading: false,
    handleSignNda: mockHandleSignNda,
    handleDocumentAccess: mockHandleDocumentAccess,
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
    it("should render loading spinner when loading", () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: null,
        documents: [],
        loading: true,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("NDA Required State", () => {
    it("should render NDA required view when NDA not signed", () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: { nda_signed: false, nda_signed_at: null },
        documents: [],
        loading: false,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      expect(screen.getByText(/Restricted Access Level/i)).toBeInTheDocument();
    });

    it("should call handleSignNda when NDA button is clicked", async () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: { nda_signed: false, nda_signed_at: null },
        documents: [],
        loading: false,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      const ndaButton = screen.getByRole("button", { name: /Initiate NDA Protocol/i });
      fireEvent.click(ndaButton);
      expect(mockHandleSignNda).toHaveBeenCalledTimes(1);
    });
  });

  describe("NDA Signed State", () => {
    it("should render documents list when NDA is signed", () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: { nda_signed: true, nda_signed_at: "2024-01-01T00:00:00Z" },
        documents: [],
        loading: false,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      expect(screen.getByText(/Clearance Level: UNLOCKED/i)).toBeInTheDocument();
    });

    it("should show empty state when no documents assigned", () => {
      vi.mocked(useInvestorDocuments).mockReturnValue({
        user: { id: "user-1", email: "test@example.com" },
        ndaStatus: { nda_signed: true, nda_signed_at: "2024-01-01" },
        documents: [],
        loading: false,
        handleSignNda: mockHandleSignNda,
        handleDocumentAccess: mockHandleDocumentAccess,
        DOCUSIGN_NDA_URL: "https://demo.docusign.net",
      });
      render(<DocumentsTab />);
      expect(screen.getByText(/No documents assigned yet/i)).toBeInTheDocument();
    });
  });
});
