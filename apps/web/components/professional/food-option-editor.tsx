"use client";

import { useTranslations } from "next-intl";
import type { Dispatch } from "react";

import { NumberField, SelectField, TextField, ToggleField } from "./fields";
import { RemoveButton } from "./section-card";
import { FOOD_UNITS } from "@/lib/professional/enums";
import type { BuilderAction } from "@/lib/professional/reducer";
import type { BuilderOption } from "@/lib/professional/types";

type Props = {
  mealId: string;
  slotId: string;
  option: BuilderOption;
  dispatch: Dispatch<BuilderAction>;
};

/** One approved option row: food name, quantity, unit, default toggle. */
export function FoodOptionEditor({ mealId, slotId, option, dispatch }: Props) {
  const t = useTranslations("builder.options");
  const tu = useTranslations("foodUnits");

  const update = (patch: Partial<BuilderOption>) =>
    dispatch({ type: "updateOption", mealId, slotId, optionId: option.id, patch });

  const unitOptions = FOOD_UNITS.map((unit) => ({ value: unit, label: tu(unit) }));

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
    </div>
  );
}
