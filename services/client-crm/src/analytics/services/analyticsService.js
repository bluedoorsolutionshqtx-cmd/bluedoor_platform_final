import { saveAnalyticsEvent } from '../saveAnalyticsEvent.js';
import { getAnalyticsSummary } from '../getAnalyticsSummary.js';

export async function trackEvent(
  eventType,
  entityType,
  entityId,
  payload
) {
  return saveAnalyticsEvent(
    eventType,
    entityType,
    entityId,
    payload
  );
}

export async function getSummary() {
  return getAnalyticsSummary();
}
