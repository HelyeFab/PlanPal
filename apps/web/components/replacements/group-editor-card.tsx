"use client";

import { useTranslations } from "next-intl";

import { ActionPill } from "../action-pill";
import {
  NumberField,
  SelectField,
  TextField,
} from "../professional/fields";
import { RemoveButton, SectionCard } from "../professional/section-card";
import {
  newEditableMember,
  type EditableGroup,
  type EditableMacros,
  type EditableMember,
} from "@/lib/replacements/groups-client";
import { FOOD_UNITS } from "@/lib/professional/enums";
import { FOOD_ROLES, type FoodRole, type FoodUnit } from "@planpal/shared";

type Props = {
  group: EditableGroup;
  onChange: (group: EditableGroup) => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
};

const MACROS: Array<keyof EditableMacros> = [
  "calories",
  "protein",
  "carbohydrates",
  "fat",
  "fibre",
];

/** One replacement group: name, role, macro tolerance, and member foods (MVP-8a). */
export function GroupEditorCard({ group, onChange, onSave, onDelete, saving }: Props) {
  const t = useTranslations("replacements");
  const tr = useTranslations("foodRoles");
  const tu = useTranslations("foodUnits");

  const roleOptions = FOOD_ROLES.map((role) => ({ value: role, label: tr(role) }));
  const unitOptions = FOOD_UNITS.map((unit) => ({ value: unit, label: tu(unit) }));

  const setGroup = (patch: Partial<EditableGroup>) => onChange({ ...group, ...patch });
  const setMember = (id: string, patch: Partial<EditableMember>) =>
    onChange({
      ...group,
      members: group.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  const setMemberMacro = (id: string, key: keyof EditableMacros, value: number | "") =>
    onChange({
      ...group,
      members: group.members.map((m) =>
        m.id === id ? { ...m, nutrition: { ...m.nutrition, [key]: value } } : m,
      ),
    });

  return (
    <SectionCard
      title={group.name.trim() || t("untitledGroup")}
      action={
        <div className="flex gap-2">
          <ActionPill variant="solid" onClick={onSave}>
            {saving ? t("saving") : t("saveGroup")}
          </ActionPill>
          <RemoveButton label={t("deleteGroup")} onClick={onDelete} />
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label={t("groupName")}
          value={group.name}
          onChange={(name) => setGroup({ name })}
          placeholder={t("groupNamePlaceholder")}
        />
        <SelectField
          label={t("groupRole")}
          value={group.role}
          onChange={(role) => setGroup({ role: role as FoodRole })}
          options={roleOptions}
        />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-faint">
        {t("tolerance")}
      </p>
      <div className="mt-1 grid grid-cols-3 gap-2">
        <NumberField
          label={t("toleranceCalories")}
          value={group.tolerance.caloriesPercent}
          onChange={(v) =>
            setGroup({ tolerance: { ...group.tolerance, caloriesPercent: v } })
          }
        />
        <NumberField
          label={t("toleranceProtein")}
          value={group.tolerance.proteinPercent}
          onChange={(v) =>
            setGroup({ tolerance: { ...group.tolerance, proteinPercent: v } })
          }
        />
        <NumberField
          label={t("toleranceFat")}
          value={group.tolerance.fatGrams}
          onChange={(v) =>
            setGroup({ tolerance: { ...group.tolerance, fatGrams: v } })
          }
        />
      </div>
      <p className="mt-1 text-xs text-faint">{t("toleranceHint")}</p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">
          {t("members")}
        </p>
        <ActionPill
          variant="soft"
          icon="+"
          className="px-3 py-1.5"
          onClick={() => onChange({ ...group, members: [...group.members, newEditableMember()] })}
        >
          {t("addMember")}
        </ActionPill>
      </div>

      {group.members.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{t("noMembers")}</p>
      ) : (
        <div className="mt-2 flex flex-col gap-3">
          {group.members.map((member) => (
            <div key={member.id} className="rounded-2xl border border-line bg-surface-muted/50 p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <TextField
                    label={t("memberFood")}
                    value={member.foodName}
                    onChange={(foodName) => setMember(member.id, { foodName })}
                    placeholder={t("memberFoodPlaceholder")}
                  />
                </div>
                <RemoveButton
                  label={t("removeMember")}
                  onClick={() =>
                    onChange({
                      ...group,
                      members: group.members.filter((m) => m.id !== member.id),
                    })
                  }
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[6rem_1fr]">
                <NumberField
                  label={t("memberQuantity")}
                  value={member.quantity}
                  onChange={(quantity) => setMember(member.id, { quantity })}
                />
                <SelectField
                  label={t("memberUnit")}
                  value={member.unit}
                  onChange={(unit) => setMember(member.id, { unit: unit as FoodUnit })}
                  options={unitOptions}
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MACROS.map((key) => (
                  <NumberField
                    key={key}
                    label={t(`macros.${key}`)}
                    value={member.nutrition[key]}
                    onChange={(value) => setMemberMacro(member.id, key, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
