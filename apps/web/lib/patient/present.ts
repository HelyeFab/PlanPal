/**
 * Patient-safe presentation of engine replacement results (MVP-10a, ADR-017).
 *
 * PURE and reusable: maps the deterministic engine's `ReplacementResult` into
 * three patient buckets with only patient-safe data + a small set of patient
 * reason keys. It NEVER emits engine internals (classification names, confidence,
 * reason/caution codes, tolerance, source, provenance, macros, replacementGroupId).
 * The UI localises the keys. Designed so the real patient route (MVP-10c) can call
 * it server-side before anything reaches an actual patient.
 */
import type { FoodReplacementCandidate, ReplacementResult } from "@planpal/shared";

export type PatientBucketKey = "can_use" | "ask_professional" | "not_a_good_match";

export type PatientReasonKey =
  | "approved_in_plan"
  | "similar_role"
  | "incomplete_nutrition"
  | "too_different";

export type PatientCandidate = {
  foodName: string;
  /** Suggested amount to act on (omitted for "not a good match"). */
  quantity?: number;
  unit?: string;
  reasonKey: PatientReasonKey;
};

export type PatientReplacementView = {
  buckets: Record<PatientBucketKey, PatientCandidate[]>;
  insufficientData: boolean;
};

function bucketFor(c: FoodReplacementCandidate): PatientBucketKey {
  if (c.classification === "approved") return "can_use";
  if (c.classification === "not_suitable") return "not_a_good_match";
  return "ask_professional"; // nutritionally_similar | needs_professional_review
}

function reasonFor(c: FoodReplacementCandidate): PatientReasonKey {
  if (c.classification === "approved") return "approved_in_plan";
  if (c.classification === "not_suitable") return "too_different";
  if (
    c.reasons.includes("missing_candidate_nutrition") ||
    c.reasons.includes("missing_original_nutrition")
  ) {
    return "incomplete_nutrition";
  }
  return "similar_role";
}

export function presentReplacements(
  result: ReplacementResult,
): PatientReplacementView {
  const buckets: Record<PatientBucketKey, PatientCandidate[]> = {
    can_use: [],
    ask_professional: [],
    not_a_good_match: [],
  };

  for (const c of result.candidates) {
    const bucket = bucketFor(c);
    const showAmount = bucket !== "not_a_good_match";
    buckets[bucket].push({
      foodName: c.foodName,
      quantity: showAmount ? c.suggestedQuantity : undefined,
      unit: showAmount ? c.unit : undefined,
      reasonKey: reasonFor(c),
    });
  }

  return { buckets, insufficientData: result.insufficientData };
}
