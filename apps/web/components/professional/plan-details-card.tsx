"use client";

import { useTranslations } from "next-intl";
import type { Dispatch } from "react";

import { SelectField, TextAreaField, TextField } from "./fields";
import { SectionCard } from "./section-card";
import { SUPPORTED_LOCALES } from "@planpal/shared";
import type { SupportedLocale } from "@planpal/shared";
import type { BuilderAction } from "@/lib/professional/reducer";
import type { BuilderPlan, BuilderPlanStatus } from "@/lib/professional/types";

type Props = {
  plan: BuilderPlan;
  dispatch: Dispatch<BuilderAction>;
  titleError?: string;
};

const STATUSES: readonly BuilderPlanStatus[] = ["draft", "active"];

/** Step 2 — plan details: title, status, language, note. */
export function PlanDetailsCard({ plan, dispatch, titleError }: Props) {
  const t = useTranslations("builder.plan");
  const ts = useTranslations("builder.plan.status");
  const tl = useTranslations("language");

  const statusOptions = STATUSES.map((status) => ({
    value: status,
    label: ts(status),
  }));
  const languageOptions = SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    label: tl(locale),
  }));

  return (
    <SectionCard title={t("heading")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            label={t("titleLabel")}
            value={plan.title}
            onChange={(title) => dispatch({ type: "setPlan", patch: { title } })}
            placeholder={t("titlePlaceholder")}
            error={titleError}
          />
        </div>
        <SelectField
          label={t("statusLabel")}
          value={plan.status}
          onChange={(status) =>
            dispatch({
              type: "setPlan",
              patch: { status: status as BuilderPlanStatus },
            })
          }
          options={statusOptions}
        />
        <SelectField
          label={t("languageLabel")}
          value={plan.language}
          onChange={(language) =>
            dispatch({
              type: "setPlan",
              patch: { language: language as SupportedLocale },
            })
          }
          options={languageOptions}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            label={t("notesLabel")}
            value={plan.notes}
            onChange={(notes) => dispatch({ type: "setPlan", patch: { notes } })}
            placeholder={t("notesPlaceholder")}
          />
        </div>
      </div>
    </SectionCard>
  );
}
