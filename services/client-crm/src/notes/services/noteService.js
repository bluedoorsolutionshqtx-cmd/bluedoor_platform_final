import { saveNote } from '../saveNote.js';
import { getNotes } from '../getNotes.js';

export async function addLeadNote(
  leadId,
  note,
  createdBy = 'system'
) {
  return saveNote(
    'lead',
    leadId,
    note,
    createdBy
  );
}

export async function addClientNote(
  clientId,
  note,
  createdBy = 'system'
) {
  return saveNote(
    'client',
    clientId,
    note,
    createdBy
  );
}

export async function getLeadNotes(
  leadId
) {
  return getNotes(
    'lead',
    leadId
  );
}

export async function getClientNotes(
  clientId
) {
  return getNotes(
    'client',
    clientId
  );
}
