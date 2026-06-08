"use client";

import { useTranslations } from "next-intl";
import type { Dispatch } from "react";

import { FoodSlotEditor } from "./food-slot-editor";
import { SelectField, TextField, TextAreaField } from "./fields";
import { ActionPill } from "../action-pill";
import { RemoveButton } from "./section-card";
import { MEAL_NAMES } from "@/lib/professional/enums";
import type { BuilderAction } from "@/lib/professional/reducer";
import type { BuilderMeal } from "@/lib/professional/types";

type Props = {
  meal: BuilderMeal;
  index: number;
  dispatch: Dispatch<BuilderAction>;
};

/** One meal: name/time/notes, then its food slots. */
export function MealEditorCard({ meal, index, dispatch }: Props) {
  const t = useTranslations("builder.meals");
  const ts = useTranslations("builder.slots");
  const tm = useTranslations("mealNames");

  const update = (patch: Partial<BuilderMeal>) =>
    dispatch({ type: "updateMeal", mealId: meal.id, patch });

  const mealNameOptions = MEAL_NAMES.map((name) => ({
    value: name,
    label: tm(name),
  }));

  return (
    <div className="rounded-card border border-line bg-surface-muted/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-ink">
          {meal.displayName.trim() || tm(meal.name)}
          <span className="ml-2 text-xs font-medium text-faint">#{index + 1}</span>
        </h3>
        <RemoveButton
          label={t("remove")}
          onClick={() => dispatch({ type: "removeMeal", mealId: meal.id })}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <SelectField
          label={t("nameLabel")}
          value={meal.name}
          onChange={(name) => update({ name: name as BuilderMeal["name"] })}
          options={mealNameOptions}
        />
        <TextField
          label={t("timeLabel")}
          type="time"
          value={meal.timeLabel}
          onChange={(timeLabel) => update({ timeLabel })}
        />
        <div className="sm:col-span-2">
          <TextField
            label={t("displayNameLabel")}
            value={meal.displayName}
            onChange={(displayName) => update({ displayName })}
            placeholder={t("displayNamePlaceholder")}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label={t("notesLabel")}
            value={meal.notes}
            onChange={(notes) => update({ notes })}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-faint">
            {ts("heading")}
          </p>
          <ActionPill
            variant="soft"
            icon="+"
            className="px-3 py-1.5"
            onClick={() => dispatch({ type: "addSlot", mealId: meal.id })}
          >
            {ts("add")}
          </ActionPill>
        </div>
        {meal.slots.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{ts("empty")}</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {meal.slots.map((slot) => (
              <FoodSlotEditor
                key={slot.id}
                mealId={meal.id}
                slot={slot}
                dispatch={dispatch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
