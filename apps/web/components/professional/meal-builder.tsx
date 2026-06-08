"use client";

import { useTranslations } from "next-intl";
import type { Dispatch } from "react";

import { MealEditorCard } from "./meal-editor-card";
import { ActionPill } from "../action-pill";
import { SectionCard } from "./section-card";
import type { BuilderAction } from "@/lib/professional/reducer";
import type { BuilderMeal } from "@/lib/professional/types";

type Props = {
  meals: BuilderMeal[];
  dispatch: Dispatch<BuilderAction>;
};

/** Meals section: the list of meal editors plus an "Add meal" action. */
export function MealBuilder({ meals, dispatch }: Props) {
  const t = useTranslations("builder.meals");

  return (
    <SectionCard
      title={t("heading")}
      subtitle={t("subtitle")}
      action={
        <ActionPill
          variant="solid"
          icon="+"
          onClick={() => dispatch({ type: "addMeal" })}
        >
          {t("add")}
        </ActionPill>
      }
    >
      {meals.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface-muted/60 p-4 text-sm text-muted">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {meals.map((meal, index) => (
            <MealEditorCard
              key={meal.id}
              meal={meal}
              index={index}
              dispatch={dispatch}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
