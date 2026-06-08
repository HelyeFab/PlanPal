"use client";

import { useTranslations } from "next-intl";
import type { Dispatch } from "react";

import { FoodOptionEditor } from "./food-option-editor";
import { SelectField, TextField, ToggleField } from "./fields";
import { ActionPill } from "../action-pill";
import { RemoveButton } from "./section-card";
import { FOOD_CATEGORIES } from "@/lib/professional/enums";
import type { BuilderAction } from "@/lib/professional/reducer";
import type { BuilderSlot } from "@/lib/professional/types";

type Props = {
  mealId: string;
  slot: BuilderSlot;
  dispatch: Dispatch<BuilderAction>;
};

/** A food slot: label + category + required, then its approved options. */
export function FoodSlotEditor({ mealId, slot, dispatch }: Props) {
  const t = useTranslations("builder.slots");
  const to = useTranslations("builder.options");
  const tc = useTranslations("foodCategories");

  const update = (patch: Partial<BuilderSlot>) =>
    dispatch({ type: "updateSlot", mealId, slotId: slot.id, patch });

  const categoryOptions = FOOD_CATEGORIES.map((category) => ({
    value: category,
    label: tc(category),
  }));

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <TextField
            label={t("labelLabel")}
            value={slot.label}
            onChange={(label) => update({ label })}
            placeholder={t("labelPlaceholder")}
          />
        </div>
        <RemoveButton
          label={t("remove")}
          onClick={() => dispatch({ type: "removeSlot", mealId, slotId: slot.id })}
        />
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <SelectField
          label={t("categoryLabel")}
          value={slot.category}
          onChange={(category) =>
            update({ category: category as BuilderSlot["category"] })
          }
          options={categoryOptions}
        />
        <div className="pb-2">
          <ToggleField
            label={t("requiredLabel")}
            checked={slot.required}
            onChange={(required) => update({ required })}
          />
        </div>
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
          {to("heading")}
        </p>
        {slot.options.length === 0 ? (
          <p className="text-sm text-muted">{to("empty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {slot.options.map((option) => (
              <FoodOptionEditor
                key={option.id}
                mealId={mealId}
                slotId={slot.id}
                option={option}
                dispatch={dispatch}
              />
            ))}
          </div>
        )}
        <ActionPill
          variant="soft"
          className="mt-3"
          icon="+"
          onClick={() => dispatch({ type: "addOption", mealId, slotId: slot.id })}
        >
          {to("add")}
        </ActionPill>
      </div>
    </div>
  );
}
