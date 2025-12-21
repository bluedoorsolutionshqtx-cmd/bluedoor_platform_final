export function enforcePricingFloor(input: { proposedPriceCents: number; floorCents: number }) {
  if (input.proposedPriceCents < input.floorCents) {
    throw new Error(`PRICING_FLOOR_VIOLATION proposed=${input.proposedPriceCents} floor=${input.floorCents}`);
  }
}
