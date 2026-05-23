// routes/cronRoutes.js
// These two endpoints are called by your third-party cron service.
//
// Daily cron   (every day at 00:00 IST):  POST /api/cron/daily
// Yearly cron  (Jan 1 at 00:01 IST):      POST /api/cron/yearly
//
// Both are protected by the cronAuth middleware (Bearer token).

import { Router } from 'express';
import { runDailyCron, runYearlyCron } from '../controllers/cronController.js';
import { cronAuth } from '../middleware/cronAuth.js';

const router = Router();

router.post('/daily', runDailyCron);
router.post('/yearly', runYearlyCron);

export default router;