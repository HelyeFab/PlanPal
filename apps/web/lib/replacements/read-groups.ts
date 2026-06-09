import "server-only";

import { getAdminDb } from "@/lib/firebase/server";
import type {
  FoodRole,
  ReplacementGroup,
  ReplacementGroupMember,
  ReplacementTolerance,
} from "@planpal/shared";

/**
 * Read the professional's owned replacement groups (MVP-8b). Caller must already
 * have resolved `uid` from the verified session cookie — reads only under
 * nutritionists/{uid}.
 */
export async function readReplacementGroups(
  uid: string,
): Promise<ReplacementGroup[]> {
  const snap = await getAdminDb()
    .collection(`nutritionists/${uid}/replacementGroups`)
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      nutritionistId: uid,
      name: typeof d.name === "string" ? d.name : "",
      role: d.role as FoodRole,
      tolerance: d.tolerance as ReplacementTolerance,
      members: Array.isArray(d.members)
        ? (d.members as ReplacementGroupMember[])
        : [],
      createdAt: "",
      updatedAt: "",
    };
  });
}
