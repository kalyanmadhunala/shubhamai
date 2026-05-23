// routes/customEventRoutes.js

import { Router } from 'express';
import {
  createCustomEvent,
  getCustomEvents,
  deleteCustomEvent,
} from '../controllers/customEventController.js';

const router = Router();

router.get('/',     getCustomEvents);   // List all custom events
router.post('/',    createCustomEvent); // Add a new custom event
router.delete('/:id', deleteCustomEvent); // Delete a custom event + remove from TodayEvent

export default router;