"use client";

import { useTranslations } from "next-intl";
import type { Dispatch } from "react";

import { SelectField, TextAreaField, TextField } from "./fields";
import { SectionCard } from "./section-card";
import { SUPPORTED_LOCALES } from "@planpal/shared";
import type { SupportedLocale } from "@planpal/shared";
import type { BuilderAction } from "@/lib/professional/reducer";
import type { BuilderClient } from "@/lib/professional/types";

type Props = {
  client: BuilderClient;
  preferredLanguage: SupportedLocale;
  dispatch: Dispatch<BuilderAction>;
  nameError?: string;
};

/** Step 1 — minimal client details (no account creation in MVP). */
export function ClientDetailsCard({
  client,
  preferredLanguage,
  dispatch,
  nameError,
}: Props) {
  const t = useTranslations("builder.client");
  const tl = useTranslations("language");

  const languageOptions = SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    label: tl(locale),
  }));

  return (
    <SectionCard title={t("heading")} subtitle={t("subtitle")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            label={t("nameLabel")}
            value={client.name}
            onChange={(name) => dispatch({ type: "setClient", patch: { name } })}
            placeholder={t("namePlaceholder")}
            error={nameError}
          />
        </div>
        <SelectField
          label={t("languageLabel")}
          value={preferredLanguage}
          onChange={(language) =>
            dispatch({
              type: "setPreferredLanguage",
              language: language as SupportedLocale,
            })
          }
          options={languageOptions}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            label={t("noteLabel")}
            value={client.note}
            onChange={(note) => dispatch({ type: "setClient", patch: { note } })}
            placeholder={t("notePlaceholder")}
          />
        </div>
      </div>
    </SectionCard>
  );
}
