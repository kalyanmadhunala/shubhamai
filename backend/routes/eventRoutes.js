// routes/eventRoutes.js

import { Router } from "express";
import {
  getEvents,
  getTodayEvents,
  getEventById,
  searchEvents,
  addEvent,
  bulkAddEvents,
  getCustomEvents,
  deleteCustomEvent,
  getAllYearEvents,
} from "../controllers/eventController.js";

const router = Router();

// ── Public read routes ────────────────────────────────────────────────────────
router.get("/", getEvents); // All Events screen (filtered by month from YearEvent)
router.get("/all", getAllYearEvents); // All Events screen (filtered by month from YearEvent)
router.get("/today", getTodayEvents); // Today screen (from TodayEvent)
router.get("/search", searchEvents); // Search screen (?q=query)
router.get("/customevents", getCustomEvents);
router.post("/customevent/:id", deleteCustomEvent); // Single event detail
router.get("/:id", getEventById); // Single event detail

// ── Admin / seeding (lock behind IP allowlist or secret header in prod) ───────
router.post("/", addEvent);
router.post("/bulk", bulkAddEvents);

export default router;
