"use client";

import { useEditorStore } from "@/store/editorStore";
import { componentRegistry } from "@/editor/components/registry";
import { Trash2, Settings, Sliders, ChevronLeft, ChevronRight, Ungroup, BoxSelect, Columns } from "lucide-react";
import { SpacingControl } from "@/editor/components/shared/SpacingControl";
import { BackgroundControls } from "@/editor/components/shared/BackgroundControls";

const HAS_DEDICATED_BG_CONTROL = new Set([
  "header",
  "footer",
  "hero",
  "newsletter",
  "post-grid",
  "testimonials",
  "faq",
  "grid-gallery",
  "logo-cloud",
  "related-posts",
  "stats",
  "team",
  "section",
  "container",
  "columns",
  "cards",
]);

const HAS_DEDICATED_SPACING_CONTROL = new Set([
  "header",
  "footer",
  "hero",
  "section",
  "container",
  "columns",
  "faq",
  "grid-gallery",
  "logo-cloud",
  "post-grid",
  "stats",
  "team",
  "testimonials",
]);

export default function RightSidebar() {
  const {
    selectedBlockId,
    document: themeDoc,
    updateBlockProps,
    updateBlockStyles,
    deleteBlock,
    unwrapBlock,
    wrapBlock,
    makeAdjacent,
    isRightSidebarOpen,
    toggleRightSidebar,
  } = useEditorStore();

  const selectedBlock = selectedBlockId ? themeDoc.blocks[selectedBlockId] : null;

  const getInputValue = (val: unknown): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null && "desktop" in val) {
      return String((val as { desktop?: unknown }).desktop || "");
    }
    return String(val);
  };

  const handleStyleChange = (key: string, value: unknown) => {
    if (selectedBlockId) {
      updateBlockStyles(selectedBlockId, { [key]: value });
    }
  };

  if (!isRightSidebarOpen) {
    return (
      <aside className="builder-right-sidebar w-[44px] border-l border-brand-hairline bg-brand-canvas text-brand-ink flex flex-col items-center py-3 shrink-0 select-none shadow-level-1 gap-4 transition-all duration-200 z-30">
        <button
          onClick={() => toggleRightSidebar(true)}
          className="p-2 text-brand-mute hover:text-brand-ink hover:bg-brand-canvas-soft rounded-sm transition-colors"
          title="Expand inspector"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="w-6 h-[1px] bg-brand-hairline" />
        <button
          onClick={() => toggleRightSidebar(true)}
          className={`p-2 rounded-sm transition-colors ${
            selectedBlockId ? "text-brand-ink bg-brand-canvas-soft shadow-xs" : "text-brand-mute hover:text-brand-ink"
          }`}
          title={selectedBlockId ? `Inspect ${themeDoc.blocks[selectedBlockId]?.type || "Block"}` : "Inspector"}
        >
          <Sliders size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="builder-right-sidebar w-[300px] border-l border-brand-hairline bg-brand-canvas text-brand-ink flex flex-col shrink-0 select-none shadow-level-1 overflow-y-auto transition-all duration-200">
      {selectedBlock ? (
        <div className="p-4 flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-brand-hairline pb-3">
            <div className="flex items-center gap-1.5">
              <Sliders size={13} className="text-brand-ink" />
              <span className="font-sans font-bold text-xs uppercase tracking-wider text-brand-ink">
                Inspect: {selectedBlock.type}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Unwrap button */}
              {(selectedBlock.type === "container" || selectedBlock.type === "section" || (selectedBlock.childrenIds && selectedBlock.childrenIds.length > 0)) && (
                <button
                  type="button"
                  onClick={() => unwrapBlock(selectedBlock.id)}
                  className="p-1 text-brand-mute hover:text-brand-primary hover:bg-brand-canvas-soft rounded-sm transition-all"
                  title="Unwrap (extract all inner items)"
                >
                  <Ungroup size={14} />
                </button>
              )}
              {/* Adjacent button for containers */}
              {selectedBlock.type === "container" && (
                <button
                  type="button"
                  onClick={() => makeAdjacent(selectedBlock.id)}
                  className="p-1 text-brand-mute hover:text-brand-primary hover:bg-brand-canvas-soft rounded-sm transition-all"
                  title="Duplicate beside as adjacent column"
                >
                  <Columns size={14} />
                </button>
              )}
              {/* Wrap in container */}
              {selectedBlock.type !== "container" && selectedBlock.type !== "section" && selectedBlock.type !== "header" && selectedBlock.type !== "footer" && (
                <button
                  type="button"
                  onClick={() => wrapBlock(selectedBlock.id, "container")}
                  className="p-1 text-brand-mute hover:text-brand-primary hover:bg-brand-canvas-soft rounded-sm transition-all"
                  title="Wrap in Container"
                >
                  <BoxSelect size={14} />
                </button>
              )}
              {selectedBlock.type !== "header" &&
                selectedBlock.type !== "footer" &&
                themeDoc.layouts?.header !== selectedBlock.id &&
                themeDoc.layouts?.footer !== selectedBlock.id && (
                  <button
                    onClick={() => deleteBlock(selectedBlock.id)}
                    className="p-1 text-brand-mute hover:text-brand-error hover:bg-brand-canvas-soft-2 rounded-sm transition-all"
                    title="Delete Block"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              <button
                onClick={() => toggleRightSidebar(false)}
                className="p-1 text-brand-mute hover:text-brand-ink hover:bg-brand-canvas-soft rounded-sm transition-colors"
                title="Collapse inspector"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Global Layout Warning */}
          {(selectedBlock.type === "header" || selectedBlock.type === "footer") && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2 items-start shadow-sm">
              <span className="text-amber-500 mt-0.5">ⓘ</span>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                This section belongs to Default layout, so changes here affect every template using that layout.
              </p>
            </div>
          )}

          {/* Properties Section */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-mute">Properties</span>
            {(() => {
              const def = componentRegistry[selectedBlock.type];
              if (def) {
                const SidebarElement = def.SidebarElement;
                return (
                  <SidebarElement
                    block={selectedBlock}
                    onChangeProps={(props) => {
                      if (selectedBlockId) {
                        updateBlockProps(selectedBlockId, props);
                      }
                    }}
                    onChangeStyles={(styles) => {
                      if (selectedBlockId) {
                        updateBlockStyles(selectedBlockId, styles);
                      }
                    }}
                  />
                );
              }
              return null;
            })()}
          </div>

          {/* Styles Section */}
          <div className="flex flex-col gap-4 border-t border-brand-hairline pt-4">
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-mute">Styles</span>

            {/* Typography Styles */}
            {selectedBlock.type === "heading" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-sans font-semibold text-brand-body">Font Weight</label>
                  <select
                    value={getInputValue(selectedBlock.styles.fontWeight)}
                    onChange={(e) => handleStyleChange("fontWeight", e.target.value)}
                    className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                  >
                    <option value="">Default</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-sans font-semibold text-brand-body">Letter Spacing</label>
                  <select
                    value={getInputValue(selectedBlock.styles.letterSpacing)}
                    onChange={(e) => handleStyleChange("letterSpacing", e.target.value)}
                    className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                  >
                    <option value="">Default</option>
                    <option value="-0.05em">Tight (-0.05em)</option>
                    <option value="-0.02em">Slightly Tight (-0.02em)</option>
                    <option value="0em">Normal (0em)</option>
                    <option value="0.02em">Slightly Wide (0.02em)</option>
                    <option value="0.05em">Wide (0.05em)</option>
                    <option value="0.1em">Widest (0.1em)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-sans font-semibold text-brand-body">Font Color</label>
                    {selectedBlock.styles.textColor && (
                      <button
                        onClick={() => handleStyleChange("textColor", "")}
                        className="text-[10px] font-sans text-brand-mute hover:text-brand-error cursor-pointer"
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={getInputValue(selectedBlock.styles.textColor) || "#171717"}
                      onChange={(e) => handleStyleChange("textColor", e.target.value)}
                      className="w-8 h-8 rounded border border-brand-hairline p-0.5 cursor-pointer shrink-0 bg-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Inherit / #171717"
                      value={getInputValue(selectedBlock.styles.textColor)}
                      onChange={(e) => handleStyleChange("textColor", e.target.value)}
                      className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-mono focus:outline-none bg-brand-canvas-soft"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Layout Radius Setting */}
            {(selectedBlock.type === "button" || selectedBlock.type === "image") && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-sans font-semibold text-brand-body">Corner Radius</label>
                <select
                  value={getInputValue(selectedBlock.styles.borderRadius)}
                  onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                >
                  <option value="">Theme Default</option>
                  <option value="0px">Sharp (0px)</option>
                  <option value="4px">Soft (4px)</option>
                  <option value="8px">Round (8px)</option>
                  <option value="16px">Smooth (16px)</option>
                  <option value="9999px">Pill (9999px)</option>
                </select>
              </div>
            )}

            {/* Layout Alignment */}
            {(selectedBlock.type === "heading" || selectedBlock.type === "container") && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-sans font-semibold text-brand-body">Alignment</label>
                <div className="grid grid-cols-3 gap-1 bg-brand-canvas-soft-2 p-0.5 rounded-sm">
                  {["left", "center", "right"].map((align) => (
                    <button
                      key={align}
                      onClick={() => handleStyleChange("textAlign", align)}
                      className={`py-1 text-[10px] uppercase font-mono rounded-xs transition-all ${getInputValue(selectedBlock.styles.textAlign) === align
                        ? "bg-brand-canvas text-brand-ink shadow-level-2 font-semibold"
                        : "text-brand-mute hover:text-brand-ink"
                        }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Margin Settings */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-sans font-semibold text-brand-body">Margin Bottom</label>
              <input
                type="text"
                placeholder="e.g. 16px, 2rem"
                value={getInputValue(selectedBlock.styles.marginBottom)}
                onChange={(e) => handleStyleChange("marginBottom", e.target.value)}
                className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
              />
            </div>

            {/* Box Shadow Setting */}
            {selectedBlock.type !== "logo-cloud" && selectedBlock.type !== "heading" && selectedBlock.type !== "text" && selectedBlock.type !== "share" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-sans font-semibold text-brand-body">Box Shadow</label>
                <select
                  value={getInputValue(selectedBlock.styles.boxShadow)}
                  onChange={(e) => handleStyleChange("boxShadow", e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                >
                  <option value="">None</option>
                  <option value="0 4px 12px rgba(0,0,0,0.15)">Soft (Level 1)</option>
                  <option value="0 12px 24px rgba(0,0,0,0.25)">Medium (Level 2)</option>
                  <option value="0 20px 40px rgba(0,0,0,0.35)">Large (Level 3)</option>
                  <option value="0 12px 36px rgba(23,23,23,0.5)">Dark Glow</option>
                  <option value="0 12px 36px rgba(0,112,243,0.4)">Accent Blue Glow</option>
                </select>
              </div>
            )}

            {/* General Styling Controls */}
            {selectedBlock.type !== "header" && selectedBlock.type !== "heading" && selectedBlock.type !== "text" && selectedBlock.type !== "share" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-sans font-semibold text-brand-body">Border Line</label>
                  <select
                    value={getInputValue(selectedBlock.styles.borderWidth)}
                    onChange={(e) => handleStyleChange("borderWidth", e.target.value)}
                    className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                  >
                    <option value="">None</option>
                    <option value="1px">Thin (1px)</option>
                    <option value="2px">Medium (2px)</option>
                  </select>
                </div>
                {getInputValue(selectedBlock.styles.borderWidth) && getInputValue(selectedBlock.styles.borderWidth) !== "0px" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-sans font-semibold text-brand-body">Border Color</label>
                    <input
                      type="color"
                      value={getInputValue(selectedBlock.styles.borderColor) || "#e2e8f0"}
                      onChange={(e) => handleStyleChange("borderColor", e.target.value)}
                      className="w-full h-8 border border-brand-hairline rounded-sm focus:outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                )}
              </>
            )}
            {selectedBlock.type !== "logo-cloud" && selectedBlock.type !== "heading" && selectedBlock.type !== "text" && selectedBlock.type !== "share" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-sans font-semibold text-brand-body">Backdrop Blur (Glassmorphism)</label>
                <select
                  value={getInputValue(selectedBlock.styles.backdropBlur)}
                  onChange={(e) => handleStyleChange("backdropBlur", e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                >
                  <option value="">None</option>
                  <option value="4px">Light (4px)</option>
                  <option value="8px">Medium (8px)</option>
                  <option value="16px">Heavy (16px)</option>
                </select>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-sans font-semibold text-brand-body">Opacity</label>
              <select
                value={getInputValue(selectedBlock.styles.opacity)}
                onChange={(e) => handleStyleChange("opacity", e.target.value)}
                className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
              >
                <option value="">100% (Solid)</option>
                <option value="0.9">90%</option>
                <option value="0.75">75%</option>
                <option value="0.5">50%</option>
                <option value="0.25">25%</option>
              </select>
            </div>
            {selectedBlock.type !== "heading" && selectedBlock.type !== "text" && selectedBlock.type !== "share" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-sans font-semibold text-brand-body">Hover Effect</label>
                <select
                  value={getInputValue(selectedBlock.styles.hoverEffect)}
                  onChange={(e) => handleStyleChange("hoverEffect", e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                >
                  <option value="">None</option>
                  <option value="scale">Scale Up (1.02x)</option>
                  <option value="float">Float Up (-4px)</option>
                  <option value="glow">Soft Glow Shadow</option>
                </select>
              </div>
            )}

            {/* Section Outer / Content Width */}
            {(selectedBlock.type === "section" || selectedBlock.type === "featured-posts" || selectedBlock.type === "post-content") && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-sans font-semibold text-brand-body">Section Outer Width</label>
                  <input
                    type="text"
                    placeholder="e.g. 100%, 1400px"
                    value={getInputValue(selectedBlock.styles.width)}
                    onChange={(e) => handleStyleChange("width", e.target.value)}
                    className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-sans font-semibold text-brand-body">Inner Content Width</label>
                  <input
                    type="text"
                    placeholder="e.g. 1200px, 800px"
                    value={getInputValue(selectedBlock.styles.contentWidth)}
                    onChange={(e) => handleStyleChange("contentWidth", e.target.value)}
                    className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
                  />
                </div>
              </>
            )}

            {/* Spacing Controls with live sliders */}
            {!HAS_DEDICATED_SPACING_CONTROL.has(selectedBlock.type) && (
              <div className="border-t border-brand-hairline pt-3">
                <SpacingControl
                  title="Spacing"
                  topValue={getInputValue(selectedBlock.styles.paddingTop)}
                  bottomValue={getInputValue(selectedBlock.styles.paddingBottom)}
                  leftValue={getInputValue(selectedBlock.styles.paddingLeft)}
                  rightValue={getInputValue(selectedBlock.styles.paddingRight)}
                  onChangeTop={(val) => handleStyleChange("paddingTop", val)}
                  onChangeBottom={(val) => handleStyleChange("paddingBottom", val)}
                  onChangeHorizontal={(val) => {
                    handleStyleChange("paddingLeft", val);
                    handleStyleChange("paddingRight", val);
                  }}
                  showHorizontal={true}
                />
              </div>
            )}
            {!HAS_DEDICATED_BG_CONTROL.has(selectedBlock.type) && (
              <BackgroundControls
                styles={selectedBlock.styles}
                appearance={{ backgroundColor: (selectedBlock.styles?.backgroundColor as string) || "" }}
                onChangeStyles={(styles) => {
                  if (selectedBlockId) {
                    updateBlockStyles(selectedBlockId, styles);
                  }
                }}
                updateAppearance={(_, v) => {
                  if (selectedBlockId) {
                    updateBlockStyles(selectedBlockId, { backgroundColor: v });
                  }
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-6">
          {/* Default state: Theme settings */}
          <div className="flex items-center justify-between border-b border-brand-hairline pb-3">
            <div className="flex items-center gap-1.5">
              <Settings size={13} className="text-brand-ink" />
              <span className="font-sans font-bold text-xs uppercase tracking-wider text-brand-ink">
                Theme Settings
              </span>
            </div>
            <button
              onClick={() => toggleRightSidebar(false)}
              className="p-1 text-brand-mute hover:text-brand-ink hover:bg-brand-canvas-soft rounded-sm transition-colors"
              title="Collapse inspector"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-sans font-semibold text-brand-body">Theme Name</label>
              <input
                type="text"
                value={themeDoc.metadata?.name ?? ""}
                className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans bg-brand-canvas-soft cursor-not-allowed"
                disabled
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-sans font-semibold text-brand-body">Author</label>
              <input
                type="text"
                value={themeDoc.metadata?.author ?? ""}
                className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans bg-brand-canvas-soft cursor-not-allowed"
                disabled
              />
            </div>
            <div className="flex flex-col gap-1.5 p-2.5 rounded-md border border-brand-hairline bg-brand-canvas-soft">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-sans font-semibold text-brand-body">Typography</label>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">Ghost Admin</span>
              </div>
              <p className="text-[11px] text-brand-body leading-relaxed">
                Heading font & Body font are configured in <strong>Ghost Admin &rarr; Settings &rarr; Design & branding &rarr; Typography</strong>.
              </p>
            </div>
          </div>

          <div className="border-t border-brand-hairline pt-4 flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-mute">Help</span>
            <p className="text-xs text-brand-body leading-relaxed">
              Select any component on the visual canvas to edit its properties, typography weights, or section spacing.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
