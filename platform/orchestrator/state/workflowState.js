import pool from '../db/postgres/client.js';

export class WorkflowState {
  constructor({
    workflowId,
    workflowType,
    currentState,
    lastEvent,
    version = 1,
    updatedAt = new Date().toISOString()
  }) {
    this.workflowId = workflowId;
    this.workflowType = workflowType;
    this.currentState = currentState;
    this.lastEvent = lastEvent;
    this.version = version;
    this.updatedAt = updatedAt;
  }
}

export async function saveWorkflowState(
  payload
) {
  const state =
    new WorkflowState(payload);

  await pool.query(
    `
    INSERT INTO workflow_state (
      workflow_id,
      workflow_type,
      current_state,
      last_event,
      version,
      updated_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6
    )
    ON CONFLICT (workflow_id)
    DO UPDATE SET
      workflow_type = EXCLUDED.workflow_type,
      current_state = EXCLUDED.current_state,
      last_event = EXCLUDED.last_event,
      version = EXCLUDED.version,
      updated_at = EXCLUDED.updated_at
    `,
    [
      state.workflowId,
      state.workflowType,
      state.currentState,
      state.lastEvent,
      state.version,
      state.updatedAt
    ]
  );

  console.log(
    '[workflow state saved]',
    state.workflowId
  );

  return state;
}

export async function getWorkflowState(
  workflowId
) {
  const result =
    await pool.query(
      `
      SELECT *
      FROM workflow_state
      WHERE workflow_id = $1
      `,
      [workflowId]
    );

  return result.rows[0];
}
