// routes/eventRoutes.js

import { Router } from "express";
import {
  getEvents,
  getTodayEvents,
  searchEvents,
  addEvent,
  bulkAddEvents,
  getCustomEvents,
  deleteCustomEvent,
  getAllYearEvents,
  deleteYearEventById,
  deleteTodayEventById,
} from "../controllers/eventController.js";

const router = Router();

// ── Public read routes ────────────────────────────────────────────────────────
router.get("/", getEvents); // All Events screen (filtered by month from YearEventDB)
router.get("/all", getAllYearEvents); // All Events screen (filtered by month from YearEvent)
router.get("/today", getTodayEvents); // Today screen (from TodayEvent)
router.get("/search", searchEvents); // Search screen (?q=query)
router.get("/customevents", getCustomEvents);
router.post("/customevent/:id", deleteCustomEvent); // Single Custom event deletion
router.post("/yearevent/:id", deleteYearEventById); // Single year event deletion
router.post("/todayevent/:id", deleteTodayEventById); // Single today event deletion

// ── Admin / seeding (lock behind IP allowlist or secret header in prod) ───────
router.post("/", addEvent);
router.post("/bulk", bulkAddEvents);

export default router;
