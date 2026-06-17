import express from 'express';

import {
  addLeadNote,
  addClientNote,
  getLeadNotes,
  getClientNotes
} from '../services/noteService.js';

const router = express.Router();

router.post(
  '/leads/:id/notes',
  async (req, res) => {
    try {

      const note =
        await addLeadNote(
          req.params.id,
          req.body.note,
          req.body.created_by ||
          'system'
        );

      res.status(201).json(
        note
      );

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

router.get(
  '/leads/:id/notes',
  async (req, res) => {
    try {

      const notes =
        await getLeadNotes(
          req.params.id
        );

      res.json(notes);

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

router.post(
  '/clients/:id/notes',
  async (req, res) => {
    try {

      const note =
        await addClientNote(
          req.params.id,
          req.body.note,
          req.body.created_by ||
          'system'
        );

      res.status(201).json(
        note
      );

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

router.get(
  '/clients/:id/notes',
  async (req, res) => {
    try {

      const notes =
        await getClientNotes(
          req.params.id
        );

      res.json(notes);

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;
