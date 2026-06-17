import express from 'express';

import {
  addLeadTask,
  addClientTask,
  getLeadTasks,
  getClientTasks
} from '../services/taskService.js';

const router = express.Router();

router.post(
  '/leads/:id/tasks',
  async (req, res) => {
    try {

      const task =
        await addLeadTask(
          req.params.id,
          req.body.title,
          req.body.description,
          req.body.due_date,
          req.body.assigned_to
        );

      res.status(201).json(
        task
      );

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

router.get(
  '/leads/:id/tasks',
  async (req, res) => {
    try {

      const tasks =
        await getLeadTasks(
          req.params.id
        );

      res.json(tasks);

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

router.post(
  '/clients/:id/tasks',
  async (req, res) => {
    try {

      const task =
        await addClientTask(
          req.params.id,
          req.body.title,
          req.body.description,
          req.body.due_date,
          req.body.assigned_to
        );

      res.status(201).json(
        task
      );

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

router.get(
  '/clients/:id/tasks',
  async (req, res) => {
    try {

      const tasks =
        await getClientTasks(
          req.params.id
        );

      res.json(tasks);

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;
