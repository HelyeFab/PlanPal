"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ActionPill } from "../action-pill";
import {
  NumberField,
  SelectField,
  TextAreaField,
} from "../professional/fields";
import {
  approveReplacement,
  type ApprovalResult,
} from "@/lib/replacements/client";
import { FOOD_UNITS } from "@/lib/professional/enums";
import { FOOD_ROLES } from "@planpal/shared";
import type {
  FoodReplacementCandidate,
  FoodRole,
  FoodUnit,
  NutritionalProfile,
} from "@planpal/shared";

type Props = {
  candidate: FoodReplacementCandidate;
  mealId: string;
  foodSlotId: string;
  onClose: () => void;
  onApproved: () => void;
};

type Macros = Record<"calories" | "protein" | "carbohydrates" | "fat" | "fibre", number | "">;
const MACRO_KEYS: Array<keyof Macros> = ["calories", "protein", "carbohydrates", "fat", "fibre"];

function macrosFromProfile(p?: NutritionalProfile): Macros {
  const m: Macros = { calories: "", protein: "", carbohydrates: "", fat: "", fibre: "" };
  if (p) for (const k of MACRO_KEYS) if (typeof p[k] === "number") m[k] = p[k]!;
  return m;
}
function macrosToProfile(m: Macros): NutritionalProfile | undefined {
  const p: NutritionalProfile = {};
  for (const k of MACRO_KEYS) if (m[k] !== "") p[k] = m[k] as number;
  return Object.keys(p).length > 0 ? p : undefined;
}

/** Review-and-approve modal (MVP-9). The professional may adjust quantity, unit,
 * role, macros and notes before the candidate becomes an approved FoodOption. */
export function ApproveReplacementModal({
  candidate,
  mealId,
  foodSlotId,
  onClose,
  onApproved,
}: Props) {
  const t = useTranslations("replacements");
  const tr = useTranslations("foodRoles");
  const tu = useTranslations("foodUnits");

  const [quantity, setQuantity] = useState<number | "">(
    candidate.suggestedQuantity ?? "",
  );
  const [unit, setUnit] = useState<FoodUnit>(
    (candidate.unit as FoodUnit) ?? "g",
  );
  const [role, setRole] = useState<string>(candidate.role ?? "");
  const [macros, setMacros] = useState<Macros>(() =>
    macrosFromProfile(candidate.nutrition),
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<ApprovalResult | null>(null);

  const roleOptions = [
    { value: "", label: t("roleNone") },
    ...FOOD_ROLES.map((r) => ({ value: r, label: tr(r) })),
  ];
  const unitOptions = FOOD_UNITS.map((u) => ({ value: u, label: tu(u) }));

  async function confirm() {
    if (submitting) return;
    setSubmitting(true);
    setStatus(null);
    const result = await approveReplacement({
      mealId,
      foodSlotId,
      option: {
        foodName: candidate.foodName,
        quantity,
        unit,
        notes,
        role: role ? (role as FoodRole) : undefined,
        nutrition: macrosToProfile(macros),
        replacementGroupId: candidate.replacementGroupId,
      },
      provenance: {
        source: candidate.source,
        classification: candidate.classification,
        confidence: candidate.confidence,
      },
    });
    if (result === "ok" || result === "duplicate") {
      onApproved();
      return;
    }
    setStatus("error");
    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="text-lg font-bold text-ink">{t("approveReplacement")}</h2>
        <p className="mt-1 text-sm font-semibold text-ink">{candidate.foodName}</p>
        <p className="mt-1 text-xs text-muted">{t("editBeforeApprove")}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberField label={t("field.quantity")} value={quantity} onChange={setQuantity} />
          <SelectField
            label={t("field.unit")}
            value={unit}
            onChange={(u) => setUnit(u as FoodUnit)}
            options={unitOptions}
          />
          <SelectField
            label={t("field.role")}
            value={role}
            onChange={setRole}
            options={roleOptions}
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MACRO_KEYS.map((k) => (
            <NumberField
              key={k}
              label={t(`macros.${k}`)}
              value={macros[k]}
              onChange={(v) => setMacros((m) => ({ ...m, [k]: v }))}
            />
          ))}
        </div>

        <div className="mt-2">
          <TextAreaField label={t("field.notes")} value={notes} onChange={setNotes} />
        </div>

        <p className="mt-3 rounded-2xl bg-brand-soft px-3 py-2 text-xs font-medium text-brand">
          {t("approveSafety")}
        </p>
        {status === "error" ? (
          <p className="mt-2 text-xs font-medium text-amber">{t("approvalError")}</p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <ActionPill variant="ghost" onClick={onClose}>
            {t("cancel")}
          </ActionPill>
          <ActionPill variant="solid" icon="✓" onClick={() => void confirm()}>
            {submitting ? t("approving") : t("confirmApprove")}
          </ActionPill>
        </div>
      </div>
    </div>
  );
}
