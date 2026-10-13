/**
 * Pagination Compiler
 *
 * Ghost pagination context:
 * - Ghost exposes {{pagination}} on index.hbs, tag.hbs, and author.hbs.
 * - The {{pagination}} object includes: page, pages, total, limit, next, prev.
 * - {{page_url "next"}} and {{page_url "prev"}} generate correct paginated URLs.
 * - {{page_url N}} generates a URL for a specific page number.
 *
 * This compiler generates self-contained CSS + Ghost-native Handlebars pagination
 * that drives real navigation in exported themes. The canvas preview state
 * (previewCurrentPage / previewTotalPages) is builder-only and not compiled.
 */

import { BuilderBlock } from "@/types/theme";
import { PaginationProps, defaultProps } from "./schema";

export function compileToHbs(block: BuilderBlock): string {
  const raw = (block.props ?? {}) as Partial<PaginationProps>;

  const general: PaginationProps["general"] = {
    ...defaultProps.general,
    ...(raw.general ?? {}),
  };
  const appearance: PaginationProps["appearance"] = {
    ...defaultProps.appearance,
    ...(raw.appearance ?? {}),
  };
  const spacing: PaginationProps["spacing"] = {
    ...defaultProps.spacing,
    ...(raw.spacing ?? {}),
  };

  const wrapperId = `pagination-${block.id}`;

  const fontWeightMap: Record<string, string> = {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  };
  const fontWeight = fontWeightMap[appearance.fontWeight] ?? "500";

  // ── Alignment ───────────────────────────────────────────────────────────────
  const alignMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };
  const justifyContent = alignMap[general.alignment] ?? "center";

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const css = `
<style>
#${wrapperId} {
  padding-top: ${spacing.paddingTop};
  padding-bottom: ${spacing.paddingBottom};
}
#${wrapperId} .gh-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${justifyContent};
  gap: ${appearance.buttonGap};
  list-style: none;
  margin: 0;
  padding: 0;
}
#${wrapperId} .gh-pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${appearance.buttonSize};
  height: ${appearance.buttonSize};
  padding: 0 0.5rem;
  font-size: ${appearance.fontSize};
  font-weight: ${fontWeight};
  font-family: var(--gh-font-body, var(--font-body));
  border-radius: ${appearance.borderRadius};
  border: 1px solid ${appearance.borderColor};
  background: ${appearance.buttonBg};
  color: ${appearance.buttonText};
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}
#${wrapperId} .gh-pagination-btn:hover,
#${wrapperId} .gh-pagination-btn:focus-visible {
  background: rgba(0, 0, 0, 0.05);
  outline: 2px solid ${appearance.activeBg};
  outline-offset: 2px;
}
#${wrapperId} .gh-pagination-btn.is-active,
#${wrapperId} .gh-pagination-btn[aria-current="page"] {
  background: ${appearance.activeBg};
  color: ${appearance.activeText};
  border-color: ${appearance.activeBg};
  pointer-events: none;
}
#${wrapperId} .gh-pagination-btn.is-disabled,
#${wrapperId} .gh-pagination-btn[aria-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
#${wrapperId} .gh-pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: ${appearance.buttonSize};
  color: ${appearance.buttonText};
  opacity: 0.5;
  user-select: none;
  font-size: ${appearance.fontSize};
}
html.dark #${wrapperId} .gh-pagination-btn {
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.04);
}
html.dark #${wrapperId} .gh-pagination-btn:hover,
html.dark #${wrapperId} .gh-pagination-btn:focus-visible {
  background: rgba(255, 255, 255, 0.1);
}
@media (max-width: 640px) {
  #${wrapperId} .gh-pagination-btn {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.8rem;
  }
}
</style>`;

  // ── Ghost Handlebars Pagination ─────────────────────────────────────────────
  //
  // Ghost's {{pagination}} context is only available on archive templates
  // (index.hbs, tag.hbs, author.hbs). It provides:
  //   {{pagination.page}}       – current page number
  //   {{pagination.pages}}      – total pages
  //   {{pagination.next}}       – next page number (or undefined)
  //   {{pagination.prev}}       – prev page number (or undefined)
  //   {{page_url "next"}}       – URL for next page
  //   {{page_url "prev"}}       – URL for prev page
  //   {{page_url N}}            – URL for page N
  //
  // We use a JavaScript progressive-enhancement approach alongside the HBS
  // to generate numbered buttons dynamically from pagination context.

  const prevBtn = general.showPrev
    ? `
    {{#if pagination.prev}}
      <li>
        <a href="{{page_url "prev"}}"
           class="gh-pagination-btn"
           aria-label="Previous page"
           rel="prev">
          ${general.prevLabel || "← Prev"}
        </a>
      </li>
    {{else}}
      <li>
        <span class="gh-pagination-btn is-disabled" aria-disabled="true" aria-label="Previous page (unavailable)">
          ${general.prevLabel || "← Prev"}
        </span>
      </li>
    {{/if}}`
    : "";

  const nextBtn = general.showNext
    ? `
    {{#if pagination.next}}
      <li>
        <a href="{{page_url "next"}}"
           class="gh-pagination-btn"
           aria-label="Next page"
           rel="next">
          ${general.nextLabel || "Next →"}
        </a>
      </li>
    {{else}}
      <li>
        <span class="gh-pagination-btn is-disabled" aria-disabled="true" aria-label="Next page (unavailable)">
          ${general.nextLabel || "Next →"}
        </span>
      </li>
    {{/if}}`
    : "";

  const firstBtn = general.showFirstLast
    ? `
    {{#if pagination.prev}}
      <li>
        <a href="{{page_url 1}}" class="gh-pagination-btn" aria-label="First page">«</a>
      </li>
    {{/if}}`
    : "";

  const lastBtn = general.showFirstLast
    ? `
    {{#if pagination.next}}
      <li>
        <a href="{{page_url pagination.pages}}" class="gh-pagination-btn" aria-label="Last page">»</a>
      </li>
    {{/if}}`
    : "";

  // JavaScript to build numbered page buttons at runtime from Ghost pagination context.
  // This runs after Ghost renders the template; it reads data attributes on the wrapper.
  const visiblePages = Math.max(3, general.visiblePages ?? 5);

  const numberedPagesScript = `
<script>
(function() {
  var wrapper = document.getElementById('${wrapperId}');
  if (!wrapper) return;
  var placeholder = wrapper.querySelector('.gh-pagination-numbers-placeholder');
  if (!placeholder) return;

  var current = parseInt(placeholder.getAttribute('data-current') || '1', 10);
  var total   = parseInt(placeholder.getAttribute('data-total')   || '1', 10);
  var visible = ${visiblePages};

  if (total <= 1) { placeholder.remove(); return; }

  function buildRange(cur, tot, vis) {
    if (tot <= vis + 2) {
      var arr = [];
      for (var i = 1; i <= tot; i++) arr.push(i);
      return arr;
    }
    var half = Math.floor(vis / 2);
    var start = Math.max(2, cur - half);
    var end   = Math.min(tot - 1, start + vis - 1);
    if (end - start < vis - 1) start = Math.max(2, end - vis + 1);
    var pages = [1];
    if (start > 2) pages.push('…');
    for (var j = start; j <= end; j++) pages.push(j);
    if (end < tot - 1) pages.push('…');
    pages.push(tot);
    return pages;
  }

  var range = buildRange(current, total, visible);
  var html = range.map(function(p) {
    if (p === '…') {
      return '<li><span class="gh-pagination-ellipsis" aria-hidden="true">…</span></li>';
    }
    if (p === current) {
      return '<li><span class="gh-pagination-btn is-active" aria-current="page" aria-label="Page ' + p + '">' + p + '</span></li>';
    }
    // Build page URL: page 1 = root, others = /page/N/
    var href = p === 1 ? '/' : '/page/' + p + '/';
    // Attempt to preserve site root from current URL
    try {
      var loc = window.location;
      var base = loc.protocol + '//' + loc.host;
      // For tag/author archives, preserve the prefix path
      var path = loc.pathname.replace(/\\/page\\/\\d+\\/?$/, '').replace(/\\/$/, '');
      href = base + path + (p === 1 ? '/' : '/page/' + p + '/');
    } catch(e) {}
    return '<li><a href="' + href + '" class="gh-pagination-btn" aria-label="Page ' + p + '">' + p + '</a></li>';
  }).join('');

  placeholder.outerHTML = html;
})();
</script>`;

  // ── Full HBS output ──────────────────────────────────────────────────────────
  // The {{#if pagination}} guard means this silently renders nothing on
  // post.hbs / page.hbs where pagination context is unavailable.
  return `${css}
<div id="${wrapperId}" class="gh-pagination-wrapper">
  {{#if pagination}}
  <nav aria-label="Pagination navigation" role="navigation">
    <ul class="gh-pagination">
      ${firstBtn}
      ${prevBtn}
      {{! Numbered pages – populated at runtime by the inline script below }}
      <li>
        <span class="gh-pagination-numbers-placeholder"
              data-current="{{pagination.page}}"
              data-total="{{pagination.pages}}"
              style="display:contents"></span>
      </li>
      ${nextBtn}
      ${lastBtn}
    </ul>
  </nav>
  ${numberedPagesScript}
  {{/if}}
</div>`;
}
