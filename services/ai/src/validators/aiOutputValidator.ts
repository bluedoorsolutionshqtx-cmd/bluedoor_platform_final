import { enforcePricingFloor } from "../constraints/pricing";
import { enforceCapacity } from "../constraints/capacity";
import { enforceTimeWindow } from "../constraints/schedule";

export type AiPlan = {
  proposedPriceCents?: number;
  floorCents?: number;
  proposedStops?: number;
  maxStops?: number;
  startIso?: string;
  endIso?: string;
  earliestIso?: string;
  latestIso?: string;
};

export function validateAiPlan(plan: AiPlan) {
  if (typeof plan.proposedPriceCents === "number" && typeof plan.floorCents === "number") {
    enforcePricingFloor({ proposedPriceCents: plan.proposedPriceCents, floorCents: plan.floorCents });
  }
  if (typeof plan.proposedStops === "number" && typeof plan.maxStops === "number") {
    enforceCapacity({ proposedStops: plan.proposedStops, maxStops: plan.maxStops });
  }
  if (plan.startIso && plan.endIso && plan.earliestIso && plan.latestIso) {
    enforceTimeWindow({ startIso: plan.startIso, endIso: plan.endIso, earliestIso: plan.earliestIso, latestIso: plan.latestIso });
  }
  return true;
}
