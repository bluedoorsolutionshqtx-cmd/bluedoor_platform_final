import express from 'express';

import {
  getLeadTimeline,
  getClientTimeline
} from '../services/timelineService.js';

const router = express.Router();

router.get(
  '/leads/:id/timeline',
  async (req, res) => {
    try {

      const rows =
        await getLeadTimeline(
          req.params.id
        );

      res.json(rows);

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

router.get(
  '/clients/:id/timeline',
  async (req, res) => {
    try {

      const rows =
        await getClientTimeline(
          req.params.id
        );

      res.json(rows);

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;
