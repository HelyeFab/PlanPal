"use client";

import { useTranslations } from "next-intl";
import { useEffect, useReducer } from "react";

import { GroupEditorCard } from "./group-editor-card";
import { ActionPill } from "../action-pill";
import {
  deleteGroup,
  loadGroups,
  newEditableGroup,
  saveGroup,
  type EditableGroup,
} from "@/lib/replacements/groups-client";

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Replacement-group manager (MVP-8a). Cloud-backed (one group per Save).
 * Client-rendered after the initial load to avoid hydration mismatch (same
 * pattern as the plan builder).
 */
export function ReplacementGroupManager() {
  const t = useTranslations("replacements");
  const [groups, setGroups] = useReducer(
    (_prev: EditableGroup[], next: EditableGroup[]) => next,
    [],
  );
  const [ready, markReady] = useReducer(() => true, false);
  const [status, setStatus] = useReducer(
    (_prev: SaveStatus, next: SaveStatus) => next,
    "idle",
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadGroups();
      if (cancelled) return;
      setGroups(loaded);
      markReady();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="h-40 animate-pulse rounded-card border border-line bg-surface" />
    );
  }

  async function handleSave(group: EditableGroup) {
    setStatus("saving");
    const ok = await saveGroup(group);
    setStatus(ok ? "saved" : "error");
  }

  async function handleDelete(group: EditableGroup) {
    setGroups(groups.filter((g) => g.id !== group.id));
    await deleteGroup(group.id);
  }

  const statusLabel =
    status === "saving"
      ? t("saving")
      : status === "saved"
        ? t("saved")
        : status === "error"
          ? t("saveError")
          : null;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ActionPill
          variant="solid"
          icon="+"
          onClick={() => setGroups([...groups, newEditableGroup()])}
        >
          {t("addGroup")}
        </ActionPill>
        {statusLabel ? (
          <span
            className={`text-xs font-medium ${status === "error" ? "text-amber" : "text-mint"}`}
            role="status"
          >
            {statusLabel}
          </span>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-surface-muted/50 p-5 text-sm text-muted">
          {t("noGroups")}
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <GroupEditorCard
              key={group.id}
              group={group}
              saving={status === "saving"}
              onChange={(next) =>
                setGroups(groups.map((g) => (g.id === next.id ? next : g)))
              }
              onSave={() => void handleSave(group)}
              onDelete={() => void handleDelete(group)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
