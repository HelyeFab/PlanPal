"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Dispatch } from "react";

import { NumberField, SelectField, TextField, ToggleField } from "./fields";
import { RemoveButton } from "./section-card";
import { ActionPill } from "../action-pill";
import { FOOD_UNITS } from "@/lib/professional/enums";
import type { BuilderAction } from "@/lib/professional/reducer";
import {
  EMPTY_NUTRITION,
  type BuilderNutrition,
  type BuilderOption,
} from "@/lib/professional/types";
import { FOOD_ROLES, type FoodRole } from "@planpal/shared";

type Props = {
  mealId: string;
  slotId: string;
  option: BuilderOption;
  dispatch: Dispatch<BuilderAction>;
};

const MACROS: Array<{ key: keyof BuilderNutrition; labelKey: string }> = [
  { key: "calories", labelKey: "calories" },
  { key: "protein", labelKey: "protein" },
  { key: "carbohydrates", labelKey: "carbohydrates" },
  { key: "fat", labelKey: "fat" },
  { key: "fibre", labelKey: "fibre" },
];

/** One approved option row: food name, quantity, unit, default toggle, and an
 * optional collapsed "Nutrition & role" section (MVP-8a) for the replacement engine. */
export function FoodOptionEditor({ mealId, slotId, option, dispatch }: Props) {
  const t = useTranslations("builder.options");
  const tb = useTranslations("builder");
  const tu = useTranslations("foodUnits");
  const tr = useTranslations("foodRoles");
  const [showNutrition, setShowNutrition] = useState(false);

  const update = (patch: Partial<BuilderOption>) =>
    dispatch({ type: "updateOption", mealId, slotId, optionId: option.id, patch });

  const updateMacro = (key: keyof BuilderNutrition, value: number | "") =>
    update({ nutrition: { ...(option.nutrition ?? EMPTY_NUTRITION), [key]: value } });

  const unitOptions = FOOD_UNITS.map((unit) => ({ value: unit, label: tu(unit) }));
  const roleOptions = [
    { value: "", label: t("roleNone") },
    ...FOOD_ROLES.map((role) => ({ value: role, label: tr(role) })),
  ];

  return (
    <div className="rounded-2xl border border-line bg-surface-muted/60 p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <TextField
            label={t("foodNameLabel")}
            value={option.foodName}
            onChange={(foodName) => update({ foodName })}
            placeholder={t("foodNamePlaceholder")}
          />
        </div>
        <RemoveButton
          label={t("remove")}
          onClick={() =>
            dispatch({ type: "removeOption", mealId, slotId, optionId: option.id })
          }
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[6rem_1fr_auto] sm:items-end">
        <NumberField
          label={t("quantityLabel")}
          value={option.quantity}
          onChange={(quantity) => update({ quantity })}
        />
        <SelectField
          label={t("unitLabel")}
          value={option.unit}
          onChange={(unit) => update({ unit: unit as BuilderOption["unit"] })}
          options={unitOptions}
        />
        <div className="col-span-2 pt-1 sm:col-span-1 sm:pb-2">
          <ToggleField
            label={t("defaultLabel")}
            checked={option.isDefault}
            onChange={(isDefault) => update({ isDefault })}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowNutrition((v) => !v)}
          aria-expanded={showNutrition}
          className="text-xs font-semibold text-brand hover:text-brand-strong"
        >
          {showNutrition ? "▾ " : "▸ "}
          {t("nutritionSection")}
        </button>
        <ActionPill
          localeHref={`/professional/replacements?mealId=${mealId}&foodSlotId=${slotId}&optionId=${option.id}`}
          variant="ghost"
          icon="⇄"
          className="px-2.5 py-1 text-xs"
        >
          {tb("findReplacements")}
        </ActionPill>
      </div>

      {showNutrition ? (
        <div className="mt-2 rounded-2xl border border-line bg-surface p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <SelectField
              label={t("roleLabel")}
              value={option.role ?? ""}
              onChange={(role) =>
                update({ role: role ? (role as FoodRole) : undefined })
              }
              options={roleOptions}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {MACROS.map((macro) => (
              <NumberField
                key={macro.key}
                label={t(`macros.${macro.labelKey}`)}
                value={option.nutrition?.[macro.key] ?? ""}
                onChange={(value) => updateMacro(macro.key, value)}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-faint">{t("nutritionHint")}</p>
        </div>
      ) : null}
    </div>
  );
}
