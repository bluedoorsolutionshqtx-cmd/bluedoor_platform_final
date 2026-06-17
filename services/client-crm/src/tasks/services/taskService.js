import { saveTask } from '../saveTask.js';
import { getTasks } from '../getTasks.js';

export async function addLeadTask(
  leadId,
  title,
  description,
  dueDate,
  assignedTo
) {
  return saveTask(
    'lead',
    leadId,
    title,
    description,
    dueDate,
    assignedTo
  );
}

export async function addClientTask(
  clientId,
  title,
  description,
  dueDate,
  assignedTo
) {
  return saveTask(
    'client',
    clientId,
    title,
    description,
    dueDate,
    assignedTo
  );
}

export async function getLeadTasks(
  leadId
) {
  return getTasks(
    'lead',
    leadId
  );
}

export async function getClientTasks(
  clientId
) {
  return getTasks(
    'client',
    clientId
  );
}
