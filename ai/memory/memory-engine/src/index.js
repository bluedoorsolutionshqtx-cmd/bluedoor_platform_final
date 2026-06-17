import express from 'express';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(
  express.json()
);

function buildMemoryRecord(data) {

  return {
    eventId:
      data.eventId,
    workflowId:
      data.workflowId,
    type:
      data.type,
    storedAt:
      new Date()
        .toISOString()
  };
}

subscribe(
  'memory-engine',
  'action.memory_evaluation_requested',
  async (data) => {

    console.log(
      'MEMORY ENGINE RECEIVED:',
      data
    );

    const memoryRecord =
      buildMemoryRecord(
        data
      );

    await publish(
      'action.memory_stored',
      {
        ...data,
        memoryStored: true,
        memoryRecord
      }
    );

    console.log(
      'MEMORY STORED:',
      data.eventId
    );
  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      status: 'ok'
    });
  }
);

app.listen(
  3015,
  () => {
    console.log(
      'memory-engine running on 3015'
    );
  }
);
