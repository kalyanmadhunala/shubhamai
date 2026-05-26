// controllers/cronController.js
//
// Two endpoints called by your third-party cron service (e.g. cron-job.org):
//
//   POST /api/cron/daily   — midnight every day (00:00 IST)
//     • Wipes previous day's TodayEvent records
//     • Fetches today's events from Calendarific + Google Calendar
//     • Merges in any CustomEvent whose date matches today (MM-DD or YYYY-MM-DD)
//     • Inserts deduplicated results into TodayEvent collection
//
//   POST /api/cron/yearly  — once per year on Jan 1 (00:01 IST)
//     • Deletes all YearEvent records for the previous year
//     • Fetches all 12 months from Calendarific + Google Calendar
//     • Inserts deduplicated results into YearEvent collection
//
// Security: protect both routes with a shared secret header
//   Set CRON_SECRET in .env; third-party cron service sends:
//     Authorization: Bearer <CRON_SECRET>

import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import TodayEvent from "../models/TodayEventModel.js";
import YearEvent from "../models/YearEventModel.js";
import {
  fetchGoogleCalendarToday,
  fetchGoogleCalendarHolidays,
} from "../services/googleCalendarService.js";
import { normalizeKey } from "./eventController.js";
import fs from "fs";
puppeteer.use(StealthPlugin());
// ── Helpers ───────────────────────────────────────────────────────────────────
function todayISO() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function todayMMDD() {
  return todayISO().slice(5);
}

function deduplicateEvents(events) {
  const seen = new Set();
  return events.filter((e) => {
    const key = normalizeKey(e.name, e.date);
    if (!key) return false;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function fetchCalendarificToday() {
  const apiKey = process.env.CALENDARIFIC_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ [Daily Cron] CALENDARIFIC_API_KEY not set — skipping");

    return [];
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const todayISO = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const results = [];

  // ─────────────────────────────────────
  // 1. Fetch LIVE India events only
  // ─────────────────────────────────────

  try {
    const { data } = await axios.get(
      "https://calendarific.com/api/v2/holidays",
      {
        params: {
          api_key: apiKey,
          country: "IN",
          year,
          month,
          day,
          type: "national,local,observance",
        },
        timeout: 10000,
      },
    );

    const holidays = data?.response?.holidays || [];

    holidays.forEach((h) => {
      results.push({
        name: h.name || "",
        description: h.description || "",
        date: todayISO,
        isAnnual: false,
        region: "national",
        category:
          Array.isArray(h.type) && h.type.length > 0 ? h.type[0] : "Holiday",
        emoji: "🇮🇳",
        country: "India",
        tags: [h.name?.toLowerCase?.() || ""],
        promptHint: "",
        source: "calendarific",
      });
    });
  } catch (err) {
    console.error("❌ [Daily Cron] Calendarific IN error:", err.message);
  }

  try {
    const dbEvents = await YearEvent.find({
      isActive: true,

      $or: [
        // YYYY-MM-DD
        { date: todayISO },
        // MM-DD annual
        { date: mmdd },
      ],

      // Exclude India yearly
      // Calendarific events

      $nor: [
        { source: "calendarific", country: "India" },
        { category: "custom", source: "local" },
      ],
    });

    dbEvents.forEach((e) => {
      results.push({
        name: e.name || "",
        description: e.description || "",
        date: todayISO,
        isAnnual: e.isAnnual,
        region: e.region,
        category: e.category,
        emoji: e.emoji || "🎉",
        country: e.country || "",
        tags: e.tags || [],
        promptHint: e.promptHint || "",
        source: e.source || "local",
      });
    });
  } catch (err) {
    console.error("❌ [Daily Cron] DB events fetch error:", err.message);
  }

  const uniqueMap = new Map();

  for (const e of results) {
    const key = normalizeKey(e.name, e.date);
    if (!key) continue;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, e);
    }
  }

  return [...uniqueMap.values()];
}

async function fetchCalendarificYear(year) {
  const apiKey = process.env.CALENDARIFIC_API_KEY;

  // Check API key

  if (!apiKey) {
    console.warn("⚠️ [Yearly Cron] CALENDARIFIC_API_KEY not set — skipping");

    return [];
  }

  // ─────────────────────────────────────
  // Countries
  // ─────────────────────────────────────

  const countries = [
    {
      code: "IN",
      country: "India",
      region: "national",
      emoji: "🇮🇳",
    },

    {
      code: "US",
      country: "United States",
      region: "international",
      emoji: "🇺🇸",
    },

    {
      code: "GB",
      country: "United Kingdom",
      region: "international",
      emoji: "🇬🇧",
    },
  ];

  const results = [];

  try {
    // ───────────────────────────────────
    // Fetch all countries
    // ───────────────────────────────────

    for (const c of countries) {
      try {
        const { data } = await axios.get(
          "https://calendarific.com/api/v2/holidays",
          {
            params: {
              api_key: apiKey,
              country: c.code,
              year,
              type: "national,local,observance",
            },
            timeout: 15000,
          },
        );

        const holidays = data?.response?.holidays || [];

        // ───────────────────────────────
        // Map holidays
        // ───────────────────────────────

        for (const h of holidays) {
          results.push({
            name: h.name || "",
            description: h.description || "",
            // Convert YYYY-MM-DD
            // to MM-DD for recurring
            date: h.date?.iso || "",
            isAnnual: h.isAnnual,
            region: c.region,
            category:
              Array.isArray(h.type) && h.type.length > 0
                ? h.type[0]
                : "Holiday",
            emoji: c.emoji,
            country: c.country,
            tags: [h.name?.toLowerCase?.() || ""],
            promptHint: "",
            source: "calendarific",
          });
        }

        console.log(
          `✅ [Yearly Cron] Fetched ${holidays.length} ${c.code} events`,
        );
      } catch (err) {
        console.error(
          `❌ [Yearly Cron] Calendarific ${c.code} Error:`,
          err?.response?.data || err.message,
        );
      }
    }

    // ───────────────────────────────────
    // Remove duplicates
    // Same:
    //   name + date
    // ───────────────────────────────────

    const uniqueMap = new Map();

    for (const e of results) {
      const key = normalizeKey(e.name, e.date);

      if (!key) continue;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, e);
      }
    }

    const uniqueResults = [...uniqueMap.values()];

    console.log(
      `✅ [Yearly Cron] Final unique Calendarific events: ${uniqueResults.length}`,
    );

    return uniqueResults;
  } catch (err) {
    console.error(
      "❌ [Yearly Cron] Calendarific Error:",
      err?.response?.data || err.message,
    );

    return [];
  }
}

// ── Google Calendar: full year (all 12 months) ────────────────────────────────
async function fetchGoogleCalendarYear(year) {
  try {
    const events = await fetchGoogleCalendarHolidays({
      year,
    });

    return events;
  } catch (err) {
    console.warn("⚠️ [Yearly Cron] Google Calendar error:", err.message);

    return [];
  }
}

// ─── Scrape one month page ───────────────────────────────────────────────────
async function fetchMonthFestivals(month) {
  const url = `https://www.drikpanchang.com/festivals/month/festivals-${month}.html`;
  console.log(`🔄 Fetching: ${url}`);

  const { data } = await axios.get(url, { headers: HEADERS });
  const $ = cheerio.load(data);
  const results = [];
  const seen = new Set();

  $("a.dpEvent").each((_, el) => {
    const name = $(el).find(".dpEventName").text().trim();
    const rawDate = $(el).find(".dpEventGregDate").text().trim();
    const href = $(el).attr("href") || "";

    if (!name || !rawDate || seen.has(name)) return;
    seen.add(name);

    // "January 14, 2026, Wednesday" → strip weekday → parse
    const datePart = rawDate.replace(/,\s*\w+$/, "").trim();
    const parsedDate = new Date(datePart);
    if (isNaN(parsedDate)) {
      console.warn(`  ⚠️  Could not parse date: "${rawDate}" for "${name}"`);
      return;
    }

    results.push({
      name,
      description: "",
      date: parsedDate.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }),
      month: month.charAt(0).toUpperCase() + month.slice(1),
      detailUrl: href.startsWith("http")
        ? href
        : `https://www.drikpanchang.com${href}`,
      isAnnual: false,
      region: "telangana",
      category: "",
      emoji: "🏛️",
      country: "India",
      tags: [name.toLowerCase()],
      source: "drik_panchang",
    });
  });

  console.log(`  ✅ ${results.length} events found in ${month}`);
  return results;
}

// ─── Scrape all 12 months ────────────────────────────────────────────────────
async function fetchAllMonthsFestivals() {
  const allResults = [];

  for (const month of MONTHS) {
    try {
      const events = await fetchMonthFestivals(month);
      allResults.push(...events);

      // Polite delay between requests to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ❌ Failed for ${month}: ${err.message}`);
    }
  }

  // Deduplicate across months by name+date
  const seen = new Set();

  const deduped = allResults.filter((e) => {
    const key = normalizeKey(e.name, e.date);
    if (!key) return false;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  console.log(
    `\n🎉 Total: ${deduped.length} unique festivals across all months`,
  );
  return deduped;
}

async function fetchDrikTeluguYear(year) {
  try {
    const url = `https://www.drikpanchang.com/telugu/calendar/telugu-calendar.html?year=${year}`;
    console.log("🔄 Fetching:", url);

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(data);
    const results = [];

    // Each event is an <a class="dpEvent"> tag
    $("a.dpEvent").each((_, el) => {
      const name = $(el).find(".dpEventName").text().trim();

      // Date format: "January 1, 2026, Thursday"
      const rawDate = $(el).find(".dpEventGregDate").text().trim();

      if (!name || !rawDate) return;

      // Strip the weekday: "January 1, 2026, Thursday" → "January 1, 2026"
      const datePart = rawDate.replace(/,\s*\w+$/, "").trim();
      const parsedDate = new Date(datePart);

      if (isNaN(parsedDate)) {
        console.warn(`⚠️ Could not parse date: "${rawDate}"`);
        return;
      }

      const isoDate = parsedDate.toISOString().split("T")[0];

      results.push({
        name,
        description: "",
        date: isoDate,
        isAnnual: true,
        region: "telangana",
        category: "telugu_calendar",
        emoji: "🕉️",
        country: "India",
        tags: [name.toLowerCase()],
        promptHint: "",
        source: "drik_panchang",
      });
    });

    console.log(`✅ Drik fetched ${results.length} events`);

    return results;
  } catch (err) {
    console.error("❌ Drik scrape error:", err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cron/daily
// Called every day at midnight by the third-party cron service.
// ─────────────────────────────────────────────────────────────────────────────

export const runDailyCron = async (req, res) => {
  const today = todayISO(); // YYYY-MM-DD
  const mmdd = todayMMDD(); // MM-DD

  console.log(`🔄 [Daily Cron] Starting refresh for ${today}`);

  try {
    // ─────────────────────────────────────
    // 1. CLEAR OLD TODAY EVENTS
    // ─────────────────────────────────────

    await TodayEvent.deleteMany({});

    console.log("🧹 [Daily Cron] Cleared old TodayEvent records");

    // ─────────────────────────────────────
    // 2. FETCH API EVENTS
    // ─────────────────────────────────────

    const [calEvents, gcalEvents] = await Promise.all([
      fetchCalendarificToday(),

      fetchGoogleCalendarToday().catch((err) => {
        console.warn("⚠️ [Daily Cron] Google Calendar error:", err.message);

        return [];
      }),
    ]);

    // ─────────────────────────────────────
    // 3. FILTER ONLY TODAY API EVENTS
    // ─────────────────────────────────────

    const filteredCalendarific = calEvents.filter((e) => e.date === today);

    const filteredGoogleCalendar = gcalEvents.filter((e) => e.date === today);

    // ─────────────────────────────────────
    // 4. FETCH CUSTOM EVENTS
    // ─────────────────────────────────────

    const customEvents = await YearEvent.find({
      isActive: true,
      $and: [
        {
          $or: [
            { date: today }, // YYYY-MM-DD
            { date: mmdd }, // MM-DD recurring
          ],
        },
      ],
    });

    // ─────────────────────────────────────
    // 5. MAP CUSTOM EVENTS
    // ─────────────────────────────────────

    const customMapped = customEvents.map((e) => ({
      name: e.name,
      description: e.description || "",
      date: today,
      region: e.region || "",
      category: e.category || "",
      emoji: e.emoji || "🎉",
      country: e.country,
      tags: e.tags || [],
      promptHint: e.promptHint || "",
      source: e.source || "admin",
      isActive: true,
      fetchDate: today,
      customEventId: e._id,
    }));

    // ─────────────────────────────────────
    // 6. MAP API EVENTS
    // ─────────────────────────────────────

    const apiEvents = [
      ...filteredCalendarific.map((e) => ({
        ...e,
        fetchDate: today,
      })),

      ...filteredGoogleCalendar.map((e) => ({
        ...e,
        fetchDate: today,
      })),
    ];

    // ─────────────────────────────────────
    // 7. MERGE ALL EVENTS
    // ─────────────────────────────────────

    const mergedEvents = [...apiEvents, ...customMapped];

    // ─────────────────────────────────────
    // 8. REMOVE DUPLICATES
    // ─────────────────────────────────────

    const allEvents = deduplicateEvents(mergedEvents);

    // ─────────────────────────────────────
    // 9. INSERT TODAY EVENTS
    // ─────────────────────────────────────

    if (allEvents.length > 0) {
      await TodayEvent.insertMany(allEvents, {
        ordered: false,
      });

      console.log(`✅ [Daily Cron] Inserted ${allEvents.length} event(s)`);
    } else {
      console.log("⚠️ [Daily Cron] No events found to insert");
    }

    // ─────────────────────────────────────
    // 10. RESPONSE
    // ─────────────────────────────────────

    return res.json({
      success: true,
      date: today,
      inserted: allEvents.length,

      breakdown: {
        calendarific: filteredCalendarific.length,
        googleCalendar: filteredGoogleCalendar.length,
        custom: customMapped.length,
        finalUnique: allEvents.length,
      },
    });
  } catch (err) {
    console.error("❌ [Daily Cron] Error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/cron/yearly
// Called once on Jan 1 by the third-party cron service.
// ─────────────────────────────────────────────────────────────────────────────

export const runYearlyCron = async (req, res) => {
  const year = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  const currentYear = new Date(year).getFullYear();
  const prevYear = currentYear - 1;

  console.log(`🔄 [Yearly Cron] Starting yearly refresh for ${currentYear}`);

  try {
    // ─────────────────────────────────────
    // 1. Delete OLD generated events
    // ─────────────────────────────────────

    const deleted = await YearEvent.deleteMany({
      $or: [
        { source: "calendarific", eventYear: prevYear },
        { source: "google_calendar", eventYear: prevYear },
        { source: "drik_panchang", eventYear: prevYear },
        { source: "local",eventYear: prevYear, isAnnual: false },
      ],
    });

    console.log(
      `🧹 [Yearly Cron] Removed ${deleted.deletedCount} old event(s)`,
    );

    // ─────────────────────────────────────
    // 2. Skip if already fetched
    // ─────────────────────────────────────

    const alreadyFetched = await YearEvent.findOne({
      eventYear: currentYear,

      source: {
        $in: ["calendarific", "google_calendar", "drik_panchang", "local"],
      },
    });

    if (alreadyFetched) {
      console.log(`✅ [Yearly Cron] Already fetched for ${currentYear}`);

      return res.json({
        success: true,
        skipped: true,
        message: `Already fetched for ${currentYear}`,
      });
    }

    // ─────────────────────────────────────
    // 3. Fetch ALL sources in parallel
    // ─────────────────────────────────────

    const [calEvents, gcalEvents, monthlyEvents] = await Promise.all([
      fetchCalendarificYear(currentYear),

      fetchGoogleCalendarYear(currentYear).catch((err) => {
        console.warn("⚠️ [Yearly Cron] Google Calendar error:", err.message);

        return [];
      }),

      fetchAllMonthsFestivals().catch((err) => {
        console.warn("⚠️ [Yearly Cron] Monthly Festivals error:", err.message);

        return [];
      }),
    ]);

    // ─────────────────────────────────────
    // 4. Merge all events
    // ─────────────────────────────────────

    const mergedEvents = [...calEvents, ...gcalEvents, ...monthlyEvents];

    // ─────────────────────────────────────
    // 5. Global Deduplication
    // ─────────────────────────────────────

    const allEvents = deduplicateEvents(mergedEvents).map((e) => ({
      ...e,
      eventYear: currentYear,
      fetchedAt: year,
    }));

    // ─────────────────────────────────────
    // 6. Fetch existing DB events
    // ─────────────────────────────────────

    const existing = await YearEvent.find({
      eventYear: currentYear,
    }).select("name date");

    const existingKeys = new Set(
      existing.map((e) => normalizeKey(e.name, e.date)),
    );

    // ─────────────────────────────────────
    // 7. Filter NEW unique events
    // ─────────────────────────────────────

    const seenKeys = new Set();

    const newEvents = allEvents.filter((e) => {
      const key = normalizeKey(e.name, e.date);

      if (!key) return false;

      // Already exists in DB
      if (existingKeys.has(key)) {
        return false;
      }

      // Duplicate inside current batch
      if (seenKeys.has(key)) {
        return false;
      }

      seenKeys.add(key);

      return true;
    });

    // ─────────────────────────────────────
    // 8. Insert events
    // ─────────────────────────────────────

    if (newEvents.length > 0) {
      try {
        await YearEvent.insertMany(newEvents, {
          ordered: false,
        });

        console.log(
          `✅ [Yearly Cron] Inserted ${newEvents.length} new event(s)`,
        );
      } catch (insertErr) {
        console.warn(
          "⚠️ [Yearly Cron] Some duplicates skipped:",
          insertErr.message,
        );
      }
    } else {
      console.log("✅ [Yearly Cron] No new events to insert");
    }

    // ─────────────────────────────────────
    // 9. Final Response
    // ─────────────────────────────────────

    return res.json({
      success: true,
      year: currentYear,
      inserted: newEvents.length,
      breakdown: {
        calendarific: calEvents.length,
        googleCalendar: gcalEvents.length,
        monthlyFestivals: monthlyEvents.length,
        finalUnique: newEvents.length,
      },
    });
  } catch (err) {
    console.error("❌ [Yearly Cron] Error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export default { runDailyCron, runYearlyCron };
