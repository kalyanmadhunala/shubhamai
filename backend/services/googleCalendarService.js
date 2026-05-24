// backend/services/googleCalendar.service.js
//
// Fetches public Indian holiday events from Google Calendar API.
//
// Setup:
//   1. Enable Google Calendar API:
//      https://console.cloud.google.com
//
//   2. Create API Key
//
//   3. Add to .env:
//      GOOGLE_CALENDAR_API_KEY=your_key_here
//
// Public Indian Holiday Calendar:
//   en.indian#holiday@group.v.calendar.google.com

import axios from "axios";

const GOOGLE_CALENDAR_BASE = "https://www.googleapis.com/calendar/v3/calendars";

// Public Google Calendar ID for Indian Holidays
const INDIA_HOLIDAY_CALENDAR_ID = encodeURIComponent(
  "en.indian#holiday@group.v.calendar.google.com",
);

// ─────────────────────────────────────────────
// Fetch Google Calendar Events
// ─────────────────────────────────────────────

async function fetchGoogleCalendarEvents(calendarId, timeMin, timeMax) {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

  if (!apiKey) {
    console.warn(
      "⚠️ GOOGLE_CALENDAR_API_KEY not set — skipping Google Calendar fetch",
    );

    return [];
  }

  const url = `${GOOGLE_CALENDAR_BASE}/${calendarId}/events`;

  let allItems = [];

  let nextPageToken = null;

  try {
    do {
      const { data } = await axios.get(url, {
        params: {
          key: apiKey,

          timeMin,
          timeMax,

          singleEvents: true,

          orderBy: "startTime",

          maxResults: 250,

          pageToken: nextPageToken || undefined,
        },

        timeout: 15000,
      });

      const items = data?.items || [];

      allItems.push(...items);

      nextPageToken = data?.nextPageToken || null;
    } while (nextPageToken);

    return allItems;
  } catch (err) {
    console.warn(
      "⚠️ Google Calendar API fetch error:",
      err?.response?.data || err.message,
    );

    return [];
  }
}

function detectCategory(item) {
  const text = (
    item.description ||
    item.summary ||
    ""
  ).toLowerCase();

  if (text.includes("observance")) {
    return "Observance";
  }

  if (text.includes("festival")) {
    return "Festival";
  }

  if (text.includes("hindu")) {
    return "Hindu Festival";
  }

  if (text.includes("muslim")) {
    return "Muslim Festival";
  }

  if (text.includes("christian")) {
    return "Christian Holiday";
  }

  if (text.includes("public")) {
    return "Public Holiday";
  }

  return "National Holiday";
}

// ─────────────────────────────────────────────
// Parse Google Calendar Event
// ─────────────────────────────────────────────

function parseGoogleEvent(item, region = "national") {
  // All-day events use start.date
  // Timed events use start.dateTime

  const rawDate =
    item.start?.date || item.start?.dateTime?.substring(0, 10) || "";

  return {
    name: item.summary || "Unknown Event",
    description: item.description || "",
    date: rawDate,
    isAnnual: true,
    region,
    category: detectCategory(item),
    emoji: "🇮🇳",
    tags: [item.summary?.toLowerCase?.() || ""],
    source: "google_calendar",
    promptHint: "",
  };
}

// ─────────────────────────────────────────────
// Fetch Google Calendar Holidays
// Supports:
//   - Month fetch
//   - Full year fetch
// ─────────────────────────────────────────────

export async function fetchGoogleCalendarHolidays({ year, month } = {}) {
  const y = year || new Date().getFullYear();

  let timeMin;
  let timeMax;

  // ── Month Fetch ──────────────────────────

  if (month) {
    const m = month;

    const paddedMonth = String(m).padStart(2, "0");

    const daysInMonth = new Date(y, m, 0).getDate();

    timeMin = `${y}-${paddedMonth}-01T00:00:00Z`;

    timeMax = `${y}-${paddedMonth}-${String(daysInMonth).padStart(2, "0")}T23:59:59Z`;
  } else {
    // ── Full Year Fetch ────────────────────

    timeMin = `${y}-01-01T00:00:00Z`;

    timeMax = `${y}-12-31T23:59:59Z`;
  }

  try {
    const items = await fetchGoogleCalendarEvents(
      INDIA_HOLIDAY_CALENDAR_ID,
      timeMin,
      timeMax,
    );

    return items.map((item) => parseGoogleEvent(item, "national"));
  } catch (err) {
    console.warn("⚠️ Google Calendar fetch error:", err.message);

    return [];
  }
}

// ─────────────────────────────────────────────
// Fetch Today's Events
// Used by daily cron
// ─────────────────────────────────────────────

export async function fetchGoogleCalendarToday() {
  const now = new Date();

  const today = now.toISOString().slice(0, 10);

  const timeMin = `${today}T00:00:00Z`;

  const timeMax = `${today}T23:59:59Z`;

  try {
    const items = await fetchGoogleCalendarEvents(
      INDIA_HOLIDAY_CALENDAR_ID,
      timeMin,
      timeMax,
    );

    return items.map((item) => ({
      ...parseGoogleEvent(item, "national"),

      dailyFetchDate: today,
    }));
  } catch (err) {
    console.warn("⚠️ Google Calendar today fetch error:", err.message);

    return [];
  }
}

// ─────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────

export default {
  fetchGoogleCalendarHolidays,
  fetchGoogleCalendarToday,
};
