// backend/utils/cronJobs.js
// Changes vs original:
//   1. Imports fetchGoogleCalendarToday from googleCalendar.service.js
//   2. refreshDailyEvents() now also fetches Google Calendar today events
//   3. Uses the shared normalizeKey() from eventController to deduplicate
//      across all three sources (Calendarific + Google Calendar + Telangana JSON)
//      before inserting into MongoDB
//   4. Everything else (schedule, cleanup logic, idempotency) unchanged

import { schedule } from 'node-cron';
import axios from 'axios';
import eventmodel from '../models/EventModel.js';
import { fetchGoogleCalendarToday } from '../services/googleCalendarService.js';
import { normalizeKey } from '../controllers/eventController.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ── Fetch from Calendarific ───────────────────────────────────────────────────
async function fetchCalendarificToday() {
  const apiKey = process.env.CALENDARIFIC_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  CALENDARIFIC_API_KEY not set — skipping Calendarific fetch');
    return [];
  }

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const day   = now.getDate();
  const mmdd  = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const results = [];

  // India national events
  try {
    const { data } = await axios.get('https://calendarific.com/api/v2/holidays', {
      params: { api_key: apiKey, country: 'IN', year, month, day, type: 'national,local' },
      timeout: 10000,
    });
    (data?.response?.holidays || []).forEach(h => {
      results.push({
        name: h.name, description: h.description || '',
        date: mmdd, isAnnual: true, region: 'national',
        category: h.type?.[0]?.name || 'National Holiday',
        emoji: '🇮🇳', tags: [h.name.toLowerCase()],
        promptHint: '', source: 'calendarific', dailyFetchDate: todayISO(),
      });
    });
  } catch (err) { console.error('❌ [Cron] Calendarific India error:', err.message); }

  // International (US proxy)
  try {
    const { data } = await axios.get('https://calendarific.com/api/v2/holidays', {
      params: { api_key: apiKey, country: 'US', year, month, day, type: 'national' },
      timeout: 10000,
    });
    (data?.response?.holidays || []).forEach(h => {
      results.push({
        name: h.name, description: h.description || '',
        date: mmdd, isAnnual: true, region: 'international',
        category: h.type?.[0]?.name || 'International Holiday',
        emoji: '🌐', tags: [h.name.toLowerCase()],
        promptHint: '', source: 'calendarific', dailyFetchDate: todayISO(),
      });
    });
  } catch (err) { console.error('❌ [Cron] Calendarific International error:', err.message); }

  return results;
}

// ── Get today's Telangana events from static JSON ─────────────────────────────
function getTodayTelanganaEvents() {
  const mmdd = todayMMDD();
  return telanganaEvents
    .filter(e => e.date === mmdd)
    .map(e => ({ ...e, dailyFetchDate: todayISO(), source: 'local' }));
}

// ── Main refresh function ─────────────────────────────────────────────────────
export const refreshDailyEvents = async () => {
  console.log('🔄 [Cron] Refreshing daily events for', todayISO());

  try {
    // 1. Delete stale daily-fetched events from previous days
    const deleted = await eventmodel.deleteMany({
      dailyFetchDate: { $exists: true, $ne: todayISO() },
    });
    if (deleted.deletedCount > 0) {
      console.log(`🧹 [Cron] Removed ${deleted.deletedCount} stale daily event(s)`);
    }

    // 2. Skip if already fetched today (idempotent)
    const alreadyFetched = await eventmodel.findOne({ dailyFetchDate: todayISO() });
    if (alreadyFetched) {
      console.log("✅ [Cron] Today's events already in DB — skipping fetch");
      return;
    }

    // 3. Fetch from all three sources in parallel
    const [calEvents, gcalEvents, telanganaEvts] = await Promise.all([
      fetchCalendarificToday(),
      // Google Calendar: always attempt; service handles missing API key gracefully
      fetchGoogleCalendarToday().catch(err => {
        console.warn('⚠️  [Cron] Google Calendar error:', err.message);
        return [];
      }),
      Promise.resolve(getTodayTelanganaEvents()),
    ]);

    // 4. Deduplicate across all sources before inserting
    // Priority: Calendarific → Google Calendar → Telangana
    // (First occurrence of name+date key wins)
    const allNew = [...calEvents, ...gcalEvents, ...telanganaEvts];
    const seen = new Set();
    const uniqueNew = allNew.filter(e => {
      const key = normalizeKey(e.name, e.date);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (uniqueNew.length > 0) {
      await eventmodel.insertMany(uniqueNew, { ordered: false });
      console.log(
        `✅ [Cron] Inserted ${uniqueNew.length} unique event(s) for today` +
        ` (cal: ${calEvents.length}, gcal: ${gcalEvents.length}, telangana: ${telanganaEvts.length})`
      );
    } else {
      console.log('📭 [Cron] No events found for today from any source');
    }
  } catch (err) {
    console.error('❌ [Cron] Daily refresh error:', err.message);
  }
};

// ── Start the cron job ────────────────────────────────────────────────────────
export const startDailyEventRefresh = () => {
  schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron] Midnight event refresh triggered');
    await refreshDailyEvents();
  }, {
    timezone: 'Asia/Kolkata',
  });

  console.log('⏰ Daily event refresh cron started (runs at 12:00 AM IST)');

  // Run once on startup so there's always data immediately
  refreshDailyEvents();
};