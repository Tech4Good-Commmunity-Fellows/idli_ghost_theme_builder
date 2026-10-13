/**
 * Pagination Component Schema
 * Defines props, types, and defaults for the Pagination block.
 * Used across index.hbs (homepage), tag.hbs, and author.hbs Ghost templates.
 */

export interface PaginationProps {
  general: {
    /** Alignment of the pagination bar */
    alignment: "left" | "center" | "right";
    /** Show previous button */
    showPrev: boolean;
    /** Show next button */
    showNext: boolean;
    /** Label for the previous button */
    prevLabel: string;
    /** Label for the next button */
    nextLabel: string;
    /** Number of visible page buttons around the active page */
    visiblePages: number;
    /** Show first-page and last-page shortcut buttons */
    showFirstLast: boolean;
  };
  appearance: {
    /** Button background color (inactive) */
    buttonBg: string;
    /** Button text color (inactive) */
    buttonText: string;
    /** Active page button background */
    activeBg: string;
    /** Active page button text */
    activeText: string;
    /** Border color */
    borderColor: string;
    /** Border radius */
    borderRadius: string;
    /** Font size */
    fontSize: string;
    /** Font weight */
    fontWeight: "normal" | "medium" | "semibold" | "bold";
    /** Spacing between buttons */
    buttonGap: string;
    /** Button height (square) */
    buttonSize: string;
  };
  spacing: {
    paddingTop: string;
    paddingBottom: string;
  };
  /** Preview-only state: the simulated current page in the builder canvas */
  previewCurrentPage: number;
  /** Preview-only state: simulated total pages in the builder canvas */
  previewTotalPages: number;
}

export const defaultProps: PaginationProps = {
  general: {
    alignment: "center",
    showPrev: true,
    showNext: true,
    prevLabel: "← Prev",
    nextLabel: "Next →",
    visiblePages: 5,
    showFirstLast: false,
  },
  appearance: {
    buttonBg: "transparent",
    buttonText: "var(--color-body)",
    activeBg: "var(--color-primary)",
    activeText: "#ffffff",
    borderColor: "var(--color-hairline)",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "medium",
    buttonGap: "0.25rem",
    buttonSize: "2.25rem",
  },
  spacing: {
    paddingTop: "2.5rem",
    paddingBottom: "2.5rem",
  },
  previewCurrentPage: 3,
  previewTotalPages: 10,
};

export const defaultStyles = {};
