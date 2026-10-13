"use client";
import React from "react";
import { BuilderBlock } from "@/types/theme";
import { PaginationProps, defaultProps } from "./schema";
import { SpacingSliderItem } from "../shared/SpacingControl";

// ─── Reusable tiny sidebar sub-components (matching existing pattern in codebase) ──

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
    {children}
  </label>
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] uppercase font-bold text-brand-ink mb-1 border-b border-brand-hairline pb-1 block">
    {children}
  </span>
);

const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-8 h-[1.125rem] flex items-center shrink-0 rounded-full p-0.5 transition-colors ${
      checked ? "bg-blue-500" : "bg-gray-200"
    }`}
    aria-pressed={checked}
  >
    <div
      className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${
        checked ? "translate-x-3.5" : "translate-x-0"
      }`}
    />
  </button>
);

const SegmentedControl = ({
  options,
  value,
  onChange,
}: {
  options: { label: React.ReactNode; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200/50">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`flex-1 flex justify-center items-center py-1.5 text-[11px] font-medium rounded-sm transition-all ${
          value === opt.value
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const TextInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
  />
);

const ColorInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="flex items-center gap-1.5">
    <input
      type="color"
      value={value.startsWith("#") ? value : "#171717"}
      onChange={(e) => onChange(e.target.value)}
      className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
      title="Pick color"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "var(--color-body)"}
      className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
    />
  </div>
);

const NumberInput = ({
  value,
  onChange,
  min = 1,
  max = 20,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) => (
  <div className="flex items-center gap-2">
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="flex-1 h-1.5 accent-blue-500"
    />
    <span className="text-[11px] font-mono text-gray-600 w-6 text-right">{value}</span>
    {label && <span className="text-[10px] text-gray-400">{label}</span>}
  </div>
);

// ─── Main Sidebar Element ──────────────────────────────────────────────────────

export const SidebarElement = ({
  block,
  onChangeProps,
}: {
  block: BuilderBlock;
  onChangeProps: (props: Record<string, unknown>) => void;
  onChangeStyles?: (styles: Record<string, unknown>) => void;
}) => {
  const p: PaginationProps = {
    ...defaultProps,
    ...(block.props as Partial<PaginationProps>),
    general: { ...defaultProps.general, ...((block.props as Partial<PaginationProps>)?.general ?? {}) },
    appearance: { ...defaultProps.appearance, ...((block.props as Partial<PaginationProps>)?.appearance ?? {}) },
    spacing: { ...defaultProps.spacing, ...((block.props as Partial<PaginationProps>)?.spacing ?? {}) },
  };

  const updateGeneral = (patch: Partial<PaginationProps["general"]>) =>
    onChangeProps({ general: { ...p.general, ...patch } });

  const updateAppearance = (patch: Partial<PaginationProps["appearance"]>) =>
    onChangeProps({ appearance: { ...p.appearance, ...patch } });

  const updateSpacing = (patch: Partial<PaginationProps["spacing"]>) =>
    onChangeProps({ spacing: { ...p.spacing, ...patch } });

  return (
    <div className="flex flex-col gap-4">
      {/* ── GENERAL ── */}
      <div className="flex flex-col gap-2">
        <SectionHeader>General</SectionHeader>

        {/* Alignment */}
        <div className="flex flex-col gap-1">
          <Label>Alignment</Label>
          <SegmentedControl
            value={p.general.alignment}
            onChange={(v) => updateGeneral({ alignment: v as PaginationProps["general"]["alignment"] })}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
          />
        </div>

        {/* Visible pages */}
        <div className="flex flex-col gap-1">
          <Label>Visible Page Buttons</Label>
          <NumberInput
            value={p.general.visiblePages}
            onChange={(v) => updateGeneral({ visiblePages: v })}
            min={3}
            max={9}
          />
        </div>

        {/* Show Prev / Next */}
        <div className="flex items-center justify-between">
          <Label>Show Prev Button</Label>
          <Switch
            checked={p.general.showPrev}
            onChange={(v) => updateGeneral({ showPrev: v })}
          />
        </div>

        {p.general.showPrev && (
          <div className="flex flex-col gap-1">
            <Label>Prev Label</Label>
            <TextInput
              value={p.general.prevLabel}
              onChange={(v) => updateGeneral({ prevLabel: v })}
              placeholder="← Prev"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>Show Next Button</Label>
          <Switch
            checked={p.general.showNext}
            onChange={(v) => updateGeneral({ showNext: v })}
          />
        </div>

        {p.general.showNext && (
          <div className="flex flex-col gap-1">
            <Label>Next Label</Label>
            <TextInput
              value={p.general.nextLabel}
              onChange={(v) => updateGeneral({ nextLabel: v })}
              placeholder="Next →"
            />
          </div>
        )}

        {/* First / Last */}
        <div className="flex items-center justify-between">
          <Label>Show First / Last buttons</Label>
          <Switch
            checked={p.general.showFirstLast}
            onChange={(v) => updateGeneral({ showFirstLast: v })}
          />
        </div>
      </div>

      {/* ── PREVIEW STATE ── */}
      <div className="flex flex-col gap-2">
        <SectionHeader>Canvas Preview State</SectionHeader>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          These values only control the preview. In the exported Ghost theme,
          pagination is driven live by Ghost&apos;s own context.
        </p>

        <div className="flex flex-col gap-1">
          <Label>Preview: Current Page</Label>
          <NumberInput
            value={p.previewCurrentPage ?? 3}
            onChange={(v) =>
              onChangeProps({ previewCurrentPage: Math.min(v, p.previewTotalPages ?? 10) })
            }
            min={1}
            max={p.previewTotalPages ?? 10}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Preview: Total Pages</Label>
          <NumberInput
            value={p.previewTotalPages ?? 10}
            onChange={(v) => onChangeProps({ previewTotalPages: Math.max(v, 1) })}
            min={1}
            max={50}
          />
        </div>
      </div>

      {/* ── APPEARANCE ── */}
      <div className="flex flex-col gap-2">
        <SectionHeader>Appearance</SectionHeader>

        <div className="flex flex-col gap-1">
          <Label>Button Background</Label>
          <ColorInput
            value={p.appearance.buttonBg}
            onChange={(v) => updateAppearance({ buttonBg: v })}
            placeholder="transparent"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Button Text Color</Label>
          <ColorInput
            value={p.appearance.buttonText}
            onChange={(v) => updateAppearance({ buttonText: v })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Active Page Background</Label>
          <ColorInput
            value={p.appearance.activeBg}
            onChange={(v) => updateAppearance({ activeBg: v })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Active Page Text Color</Label>
          <ColorInput
            value={p.appearance.activeText}
            onChange={(v) => updateAppearance({ activeText: v })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Border Color</Label>
          <ColorInput
            value={p.appearance.borderColor}
            onChange={(v) => updateAppearance({ borderColor: v })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Border Radius</Label>
          <SegmentedControl
            value={
              p.appearance.borderRadius === "0px"
                ? "square"
                : p.appearance.borderRadius === "9999px"
                  ? "pill"
                  : "rounded"
            }
            onChange={(v) =>
              updateAppearance({
                borderRadius:
                  v === "square" ? "0px" : v === "pill" ? "9999px" : "6px",
              })
            }
            options={[
              { label: "Square", value: "square" },
              { label: "Rounded", value: "rounded" },
              { label: "Pill", value: "pill" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Font Weight</Label>
          <SegmentedControl
            value={p.appearance.fontWeight}
            onChange={(v) =>
              updateAppearance({ fontWeight: v as PaginationProps["appearance"]["fontWeight"] })
            }
            options={[
              { label: "Regular", value: "normal" },
              { label: "Medium", value: "medium" },
              { label: "Bold", value: "bold" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Button Size</Label>
          <SegmentedControl
            value={
              p.appearance.buttonSize === "1.75rem"
                ? "sm"
                : p.appearance.buttonSize === "2.75rem"
                  ? "lg"
                  : "md"
            }
            onChange={(v) =>
              updateAppearance({
                buttonSize:
                  v === "sm" ? "1.75rem" : v === "lg" ? "2.75rem" : "2.25rem",
                fontSize:
                  v === "sm" ? "0.75rem" : v === "lg" ? "1rem" : "0.875rem",
              })
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ]}
          />
        </div>
      </div>

      {/* ── SPACING ── */}
      <div className="flex flex-col gap-2">
        <SectionHeader>Spacing</SectionHeader>
        <SpacingSliderItem
          label="Padding Top"
          value={p.spacing.paddingTop}
          onChange={(v) => updateSpacing({ paddingTop: v })}
        />
        <SpacingSliderItem
          label="Padding Bottom"
          value={p.spacing.paddingBottom}
          onChange={(v) => updateSpacing({ paddingBottom: v })}
        />
      </div>

      {/* ── GHOST INFO ── */}
      <div className="flex flex-col gap-1.5 p-2.5 rounded-md border border-brand-hairline bg-brand-canvas-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-brand-body">Ghost Integration</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">
            Ghost Native
          </span>
        </div>
        <p className="text-[10px] text-brand-body leading-relaxed">
          In the exported theme, this renders Ghost&apos;s native{" "}
          <code className="bg-gray-100 px-0.5 rounded font-mono">{"{{pagination}}"}</code>{" "}
          helper which automatically handles page URLs, prev/next links, and
          ellipsis for index, tag, and author archives.
        </p>
      </div>
    </div>
  );
};
