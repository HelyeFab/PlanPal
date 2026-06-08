"use client";

import { useId } from "react";
import type { ReactNode } from "react";

/**
 * Small, consistent form primitives for the plan builder. They keep every input
 * on the same soft clinical SaaS styling (see docs/UI_REGISTRY.md) and own their
 * label/association so callers stay declarative. Labels are passed in already
 * localised by the parent.
 */

const fieldBase =
  "w-full rounded-2xl border border-line bg-surface-muted px-3 py-2 text-sm text-ink placeholder:text-faint focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-muted">
      {children}
    </label>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "time" | "email" | "password";
  autoComplete?: string;
  error?: string;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
}: TextFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className={`${fieldBase} ${error ? "border-amber" : ""}`}
      />
      {error ? <p className="text-xs text-amber">{error}</p> : null}
    </div>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${fieldBase} resize-none`}
      />
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  step?: number;
};

export function NumberField({ label, value, onChange, min = 0, step }: NumberFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        step={step}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? "" : Number(raw));
        }}
        className={fieldBase}
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
};

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldBase} appearance-none bg-surface-muted`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type ToggleFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleField({ label, checked, onChange }: ToggleFieldProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted"
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-pill transition-colors ${
          checked ? "bg-brand" : "bg-line"
        }`}
      >
        <span
          className={`inline-block size-4 rounded-full bg-white shadow-soft transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      {label}
    </label>
  );
}
