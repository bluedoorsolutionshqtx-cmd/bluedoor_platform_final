import express from 'express';
import crypto from 'crypto';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(
  express.json()
);

const contracts = {
  lead_analysis: {
    contractId: 'lead-analysis-v1',
    version: '1.0.0',
    requiredFields: [
      'id',
      'first_name',
      'last_name',
      'email'
    ]
  }
};

subscribe(
  'contract-engine',
  'action.contract_validation_requested',
  async (data) => {

    console.log(
      'CONTRACT ENGINE RECEIVED:',
      data
    );

    const definition =
      contracts[data.type];

    if (!definition) {

      await publish(
        'action.contract_rejected',
        {
          ...data,
          reason:
            'contract_not_found'
        }
      );

      return;
    }

    const payload =
      data.payload ??
      data.lead ??
      {};

    const missing =
      definition.requiredFields.filter(
        field =>
          payload[field] === undefined ||
          payload[field] === null
      );

    if (missing.length) {

      await publish(
        'action.contract_rejected',
        {
          ...data,
          reason:
            'missing_required_fields',
          missing
        }
      );

      return;
    }

    await publish(
      'action.contract_validated',
      {
        ...data,
        contractId:
          crypto.randomUUID(),
        contractName:
          definition.contractId,
        contractVersion:
          definition.version,
        contractStatus:
          'validated'
      }
    );

    console.log(
      'CONTRACT VALIDATED:',
      definition.contractId
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
  3010,
  () => {
    console.log(
      'contract-engine running on 3010'
    );
  }
);
