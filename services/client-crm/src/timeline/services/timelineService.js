import { saveTimelineEvent } from '../saveTimelineEvent.js';
import { getTimeline } from '../getTimeline.js';

export async function recordLeadEvent(
  leadId,
  eventType,
  payload
) {
  return saveTimelineEvent(
    'lead',
    leadId,
    eventType,
    payload
  );
}

export async function recordClientEvent(
  clientId,
  eventType,
  payload
) {
  return saveTimelineEvent(
    'client',
    clientId,
    eventType,
    payload
  );
}

export async function recordPropertyEvent(
  propertyId,
  eventType,
  payload
) {
  return saveTimelineEvent(
    'property',
    propertyId,
    eventType,
    payload
  );
}

export async function getLeadTimeline(
  leadId
) {
  return getTimeline(
    'lead',
    leadId
  );
}

export async function getClientTimeline(
  clientId
) {
  return getTimeline(
    'client',
    clientId
  );
}
