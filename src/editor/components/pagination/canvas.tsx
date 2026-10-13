"use client";
import React, { useState } from "react";
import { BuilderBlock } from "@/types/theme";
import { PaginationProps, defaultProps } from "./schema";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";

// ─── Helper: build the page-number sequence with ellipsis ─────────────────────
function buildPageRange(current: number, total: number, visible: number): (number | "…")[] {
  if (total <= visible + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(visible / 2);
  // Compute a preliminary start, then clamp end, then adjust start if needed.
  const prelimStart = Math.max(2, current - half);
  const prelimEnd = Math.min(total - 1, prelimStart + visible - 1);
  // If the window is too small (near end of range), shift start left.
  const start = prelimEnd - prelimStart < visible - 1
    ? Math.max(2, prelimEnd - visible + 1)
    : prelimStart;
  const end = Math.min(total - 1, start + visible - 1);

  const pages: (number | "…")[] = [1];
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);

  return pages;
}

// ─── Single page button ────────────────────────────────────────────────────────
function PageBtn({
  label,
  isActive = false,
  isDisabled = false,
  onClick,
  ariaLabel,
  appearance,
  isDark,
}: {
  label: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  appearance: PaginationProps["appearance"];
  isDark: boolean;
}) {
  const fontWeightMap: Record<string, string> = {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: appearance.buttonSize,
    height: appearance.buttonSize,
    padding: "0 0.4rem",
    fontSize: appearance.fontSize,
    fontWeight: fontWeightMap[appearance.fontWeight] ?? "500",
    borderRadius: appearance.borderRadius,
    border: `1px solid ${isActive ? appearance.activeBg : appearance.borderColor}`,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.4 : 1,
    transition: "background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s",
    outline: "none",
    background: isActive
      ? appearance.activeBg
      : isDark
        ? "rgba(255,255,255,0.04)"
        : appearance.buttonBg,
    color: isActive
      ? appearance.activeText
      : isDark
        ? "rgba(255,255,255,0.8)"
        : appearance.buttonText,
    userSelect: "none",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  return (
    <button
      type="button"
      style={baseStyle}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      onMouseEnter={(e) => {
        if (!isActive && !isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.background = isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.background = isDark
            ? "rgba(255,255,255,0.04)"
            : appearance.buttonBg;
        }
      }}
    >
      {label}
    </button>
  );
}

// ─── Ellipsis span ─────────────────────────────────────────────────────────────
function Ellipsis({ isDark, color }: { isDark: boolean; color: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "1.75rem",
        height: "1.75rem",
        fontSize: "0.875rem",
        color: isDark ? "rgba(255,255,255,0.4)" : color,
        userSelect: "none",
      }}
    >
      …
    </span>
  );
}

// ─── Canvas Element ────────────────────────────────────────────────────────────
export const CanvasElement = ({ block }: { block: BuilderBlock }) => {
  const isDark = useCanvasDarkMode();
  const p: PaginationProps = {
    ...defaultProps,
    ...(block.props as Partial<PaginationProps>),
    general: { ...defaultProps.general, ...((block.props as Partial<PaginationProps>)?.general ?? {}) },
    appearance: { ...defaultProps.appearance, ...((block.props as Partial<PaginationProps>)?.appearance ?? {}) },
    spacing: { ...defaultProps.spacing, ...((block.props as Partial<PaginationProps>)?.spacing ?? {}) },
  };

  const { general, appearance, spacing } = p;

  // Local interactive state for canvas preview
  const [currentPage, setCurrentPage] = useState<number>(
    Math.max(1, Math.min(p.previewCurrentPage ?? 3, p.previewTotalPages ?? 10))
  );
  const totalPages = Math.max(1, p.previewTotalPages ?? 10);

  const pages = buildPageRange(currentPage, totalPages, Math.max(3, general.visiblePages ?? 5));

  const alignClass: Record<string, string> = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const navigate = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
  };

  return (
    <div
      style={{
        paddingTop: spacing.paddingTop,
        paddingBottom: spacing.paddingBottom,
        background: "transparent",
        width: "100%",
      }}
    >
      <nav
        aria-label="Pagination"
        className={`flex flex-wrap items-center w-full ${alignClass[general.alignment] ?? "justify-center"}`}
        style={{ gap: appearance.buttonGap }}
      >
        {/* First page */}
        {general.showFirstLast && (
          <PageBtn
            label="«"
            ariaLabel="First page"
            isDisabled={currentPage === 1}
            onClick={() => navigate(1)}
            appearance={appearance}
            isDark={isDark}
          />
        )}

        {/* Previous */}
        {general.showPrev && (
          <PageBtn
            label={general.prevLabel || "← Prev"}
            ariaLabel="Previous page"
            isDisabled={currentPage === 1}
            onClick={() => navigate(currentPage - 1)}
            appearance={appearance}
            isDark={isDark}
          />
        )}

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === "…" ? (
            <Ellipsis key={`ellipsis-${idx}`} isDark={isDark} color={appearance.buttonText} />
          ) : (
            <PageBtn
              key={`page-${p}`}
              label={p}
              ariaLabel={`Page ${p}`}
              isActive={p === currentPage}
              onClick={() => navigate(p as number)}
              appearance={appearance}
              isDark={isDark}
            />
          )
        )}

        {/* Next */}
        {general.showNext && (
          <PageBtn
            label={general.nextLabel || "Next →"}
            ariaLabel="Next page"
            isDisabled={currentPage === totalPages}
            onClick={() => navigate(currentPage + 1)}
            appearance={appearance}
            isDark={isDark}
          />
        )}

        {/* Last page */}
        {general.showFirstLast && (
          <PageBtn
            label="»"
            ariaLabel="Last page"
            isDisabled={currentPage === totalPages}
            onClick={() => navigate(totalPages)}
            appearance={appearance}
            isDark={isDark}
          />
        )}
      </nav>

      {/* Canvas-only hint */}
      <p
        style={{
          textAlign: "center",
          marginTop: "0.5rem",
          fontSize: "0.7rem",
          opacity: 0.4,
          userSelect: "none",
          color: isDark ? "#fff" : "#000",
        }}
      >
        Preview — Page {currentPage} of {totalPages} (click buttons to test)
      </p>
    </div>
  );
};
