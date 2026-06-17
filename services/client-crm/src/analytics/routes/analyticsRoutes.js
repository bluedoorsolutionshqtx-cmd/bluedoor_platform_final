import express from 'express';

import {
  getSummary
} from '../services/analyticsService.js';

const router = express.Router();

router.get(
  '/analytics/summary',
  async (_req, res) => {
    try {

      const summary =
        await getSummary();

      res.json(
        summary
      );

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;
