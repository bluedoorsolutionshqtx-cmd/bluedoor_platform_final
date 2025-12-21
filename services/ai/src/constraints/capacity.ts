export function enforceCapacity(input: { proposedStops: number; maxStops: number }) {
  if (input.proposedStops > input.maxStops) {
    throw new Error(`CAPACITY_VIOLATION stops=${input.proposedStops} max=${input.maxStops}`);
  }
}
