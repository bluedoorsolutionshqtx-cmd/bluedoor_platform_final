export function enforceTimeWindow(input: { startIso: string; endIso: string; earliestIso: string; latestIso: string }) {
  const start = new Date(input.startIso).getTime();
  const end = new Date(input.endIso).getTime();
  const earliest = new Date(input.earliestIso).getTime();
  const latest = new Date(input.latestIso).getTime();
  if (!(start >= earliest && end <= latest && start < end)) {
    throw new Error(`TIME_WINDOW_VIOLATION start=${input.startIso} end=${input.endIso}`);
  }
}
