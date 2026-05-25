// controllers/eventController.js
//
// Responsibilities:
//   getEvents         → All Events screen  (reads YearEvent, filtered by current month)
//   getTodayEvents    → Today screen        (reads TodayEvent collection, already populated by cron)
//   searchEvents      → Search screen       (searches TodayEvent + YearEvent)
//   getEventById      → Single event detail
//   addEvent          → Admin seeding (YearEvent)
//   bulkAddEvents     → Admin bulk seed (YearEvent)

import TodayEvent from "../models/TodayEventModel.js";
import YearEvent from "../models/YearEventModel.js";

// ── Shared dedup helper ────────────────────────────────────────────────────────
export function normalizeKey(name, date) {
  if (!name || !date) return null;

  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");

  const normalizedDate = String(date).trim();
  return `${normalizedName}_${normalizedDate}`;
}

function deduplicate(events) {
  const seen = new Set();
  return events.filter((e) => {
    const key = normalizeKey(e.name, e.date);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function todayISO() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events
// All Events screen — reads from YearEvent, filtered to the current month.
// Supports ?region=all|national|international|telangana&month=M&year=YYYY
// ─────────────────────────────────────────────────────────────────────────────
export const getEvents = async (req, res) => {
  try {
    const { region = "all", month, year } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = parseInt(month) || new Date().getMonth() + 1;
    const monthPadded = String(currentMonth).padStart(2, "0");

    const query = {
      isActive: true,
      eventYear: currentYear,
      $or: [
        {
          date: {
            $regex: `^\\d{4}-${monthPadded}-\\d{2}$`,
          },
        },

        {
          date: {
            $regex: `^${monthPadded}-\\d{2}$`,
          },
        },
      ],
    };

    if (region !== "all") query.region = region;

    const events = await YearEvent.find(query).sort({ date: 1 });

    const grouped = {
      international: events.filter((e) => e.region === "international"),
      national: events.filter((e) => e.region === "national"),
      telangana: events.filter((e) => e.region === "telangana"),
    };

    return res.json({
      success: true,
      total: events.length,
      events: region === "all" ? grouped : events,
      region,
      month: currentMonth,
      year: currentYear,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/today
// Today screen — reads from TodayEvent (pre-populated by midnight cron).
// Falls back to an empty array if cron hasn't run yet.
// ─────────────────────────────────────────────────────────────────────────────
export const getTodayEvents = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const events = await TodayEvent.find({
      isActive: true,
      fetchDate: today,
    }).sort({ region: 1, name: 1 });

    return res.json({
      success: true,
      events,
      total: events.length,
      date: today,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/search?q=searchterm
// Searches both TodayEvent and YearEvent collections.
// ─────────────────────────────────────────────────────────────────────────────
export const searchEvents = async (req, res) => {
  try {
    const { q } = req.query;

    // ─────────────────────────────────────
    // Base Filter
    // ─────────────────────────────────────

    const baseFilter = {
      isActive: true,
    };

    let searchFilter = { ...baseFilter };

    // ─────────────────────────────────────
    // Search Only By Name
    // ─────────────────────────────────────

    if (q && q.trim()) {
      searchFilter.name = {
        $regex: q.trim(),
        $options: "i",
      };
    }

    // ─────────────────────────────────────
    // Fetch Only:
    //   - Year Events
    //   - Custom Events
    // ─────────────────────────────────────

    const events = await YearEvent.find({
      ...searchFilter,

      $or: [
        { category: "custom" },
        { source: "calendarific" },
        { source: "google_calendar" },
        { source: "drik_panchang" },
      ],
    })
      .sort({ date: 1 })
      .limit(2000);

    // ─────────────────────────────────────
    // Response
    // ─────────────────────────────────────

    return res.json({
      success: true,
      events,
      total: events.length,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/all
// ─────────────────────────────────────────────────────────────────────────────

export const getAllYearEvents = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const events = await YearEvent.find({
      isActive: true,
      eventYear: currentYear,
    }).sort({ date: 1 });

    return res.json({
      success: true,
      events,
      total: events.length,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE /api/events/yearevents/:id
export const deleteYearEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await YearEvent.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    return res.status(200).json({ success: true, message: "Event deleted from the Database." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/events/todayevents/:id
export const deleteTodayEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await TodayEvent.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    return res.status(200).json({ success: true, message: "Today event deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomEvents = async (req, res) => {
  try {
    // Get only user-added custom/local events
    const events = await YearEvent.find({
      isActive: true,
      category: "custom",
    }).sort({ date: 1 });

    return res.json({
      success: true,
      events,
      total: events.length,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteCustomEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const customEvent = await YearEvent.findByIdAndDelete(id);
    if (!customEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Custom event not found." });
    }

    // Remove from TodayEvent if it was injected there
    await TodayEvent.deleteMany({ customEventId: id });

    return res.json({ success: true, message: "Custom event deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events  (Admin — single seed into YearEvent)
// ─────────────────────────────────────────────────────────────────────────────

export const addEvent = async (req, res) => {
  try {
    const { name, date, description, category, region } = req.body;

    // ─────────────────────────────────────
    // Validation
    // ─────────────────────────────────────

    if (!name || !date) {
      return res.json({
        success: false,
        message: "Name and date are required",
      });
    }

    // ─────────────────────────────────────
    // Normalize Values
    // ─────────────────────────────────────

    const normalizedName = name.trim();

    const normalizedDate = date.trim();

    // ─────────────────────────────────────
    // Validate Date Format
    // Supports:
    //   YYYY-MM-DD
    //   MM-DD
    // ─────────────────────────────────────

    const fullDateRegex = /^\d{4}-\d{2}-\d{2}$/;

    const annualDateRegex = /^\d{2}-\d{2}$/;

    const isFullDate = fullDateRegex.test(normalizedDate);

    const isAnnualDate = annualDateRegex.test(normalizedDate);

    if (!isFullDate && !isAnnualDate) {
      return res.json({
        success: false,
        message: "Date must be YYYY-MM-DD or MM-DD",
      });
    }

    // ─────────────────────────────────────
    // Extract Event Year
    // ─────────────────────────────────────

    let eventYear = new Date().getFullYear();

    if (isFullDate) {
      eventYear = parseInt(normalizedDate.substring(0, 4));
    }

    // ─────────────────────────────────────
    // Check Duplicate
    // Same Name + Same Date
    // ─────────────────────────────────────

    const existingEvent = await YearEvent.findOne({
      name: {
        $regex: new RegExp(`^${normalizedName}$`, "i"),
      },

      date: normalizedDate,

      isActive: true,
    });

    if (existingEvent) {
      return res.json({
        success: false,

        message: "Event already exists for this date",
      });
    }

    // ─────────────────────────────────────
    // Create Event
    // ─────────────────────────────────────

    const event = await YearEvent.create({
      name: normalizedName,
      description: description || "",
      date: normalizedDate,
      isAnnual: isAnnualDate,
      region: (region || "telangana").toLowerCase(),
      category: (category || "custom").toLowerCase(),
      emoji: "🎉",
      country: "India",
      tags: [normalizedName.toLowerCase()],
      source: "local",
      promptHint: "",
      isActive: true,
      eventYear,
    });

    // ─────────────────────────────────────
    // Response
    // ─────────────────────────────────────

    return res.status(201).json({
      success: true,

      event,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events/bulk
// (Admin — bulk seed into YearEvent)
// ─────────────────────────────────────────────────────────────────────────────

export const bulkAddEvents = async (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || !events.length) {
      return res.status(400).json({
        success: false,

        message: "events array is required",
      });
    }

    const currentYear = new Date().getFullYear();

    // ─────────────────────────────────────
    // Normalize + Validate
    // ─────────────────────────────────────

    const preparedEvents = [];

    for (const e of events) {
      if (!e.name || !e.date) {
        continue;
      }

      const normalizedName = e.name.trim();

      const normalizedDate = e.date.trim();

      // Date validation

      const fullDateRegex = /^\d{4}-\d{2}-\d{2}$/;

      const annualDateRegex = /^\d{2}-\d{2}$/;

      const isFullDate = fullDateRegex.test(normalizedDate);

      const isAnnualDate = annualDateRegex.test(normalizedDate);

      if (!isFullDate && !isAnnualDate) {
        continue;
      }

      // Extract year

      let eventYear = currentYear;

      if (isFullDate) {
        eventYear = parseInt(normalizedDate.substring(0, 4));
      }

      preparedEvents.push({
        name: normalizedName,
        description: e.description || "",
        date: normalizedDate,
        isAnnual: isAnnualDate,
        region: (e.region || "telangana").toLowerCase(),
        category: e.category || "custom",
        emoji: e.emoji || "🎉",
        country: e.country || "India",
        tags: e.tags || [normalizedName.toLowerCase()],
        source: e.source || "local",
        promptHint: e.promptHint || "",
        isActive: true,
        eventYear,
        _normKey: normalizeKey(normalizedName, normalizedDate),
      });
    }

    // ─────────────────────────────────────
    // Remove duplicates inside request
    // ─────────────────────────────────────

    const deduped = deduplicate(preparedEvents);

    // ─────────────────────────────────────
    // Existing DB events
    // ─────────────────────────────────────

    const existing = await YearEvent.find({}).select("name date");

    const existingSet = new Set(
      existing.map((e) => normalizeKey(e.name, e.date)),
    );

    // ─────────────────────────────────────
    // Filter only NEW events
    // ─────────────────────────────────────

    const newEvents = deduped
      .filter((e) => !existingSet.has(e._normKey))
      .map(({ _normKey, ...rest }) => rest);

    // ─────────────────────────────────────
    // Nothing to insert
    // ─────────────────────────────────────

    if (!newEvents.length) {
      return res.status(200).json({
        success: true,
        message: "All events already exist",
        inserted: 0,
      });
    }

    // ─────────────────────────────────────
    // Insert events
    // ─────────────────────────────────────

    const inserted = await YearEvent.insertMany(newEvents, {
      ordered: false,
    });

    // ─────────────────────────────────────
    // Response
    // ─────────────────────────────────────

    return res.status(201).json({
      success: true,
      inserted: inserted.length,
      skipped: events.length - inserted.length,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export default {
  getEvents,
  getAllYearEvents,
  getTodayEvents,
  deleteYearEventById,
  deleteTodayEventById,
  searchEvents,
  addEvent,
  bulkAddEvents,
  getCustomEvents,
  deleteCustomEvent,
};
