// src/services/api/eventsService.js

import { CONFIG } from '../../constants/config';

const BASE = CONFIG.API_BASE_URL;

const headers = { 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { headers, ...options });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

const eventsService = {
  // ─────────────────────────────────────
  // GET EVENTS
  // ─────────────────────────────────────

  getEvents: () => request(`/events/`),

  getAllYearEvents: () => request('/events/all'),

  getTodayEvents: () => request('/events/today'),

  searchEvents: q => request(`/events/search?q=${encodeURIComponent(q)}`),

  getEventById: id => request(`/events/${id}`),

  // ─────────────────────────────────────
  // CUSTOM EVENTS
  // ─────────────────────────────────────

  // GET /api/events/customevents
  getCustomEvents: () => request('/events/customevents'),

  // POST /api/events/customevent/:id
  deleteCustomEvent: id =>
    request(`/events/customevent/${id}`, {
      method: 'POST',
    }),

  // POST /api/events
  addEvent: body => {
    console.log(body);
    return request('/events', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // DELETE TODAY EVENT

  deleteTodayEvent: id =>
    request(`/events/todayevent/${id}`, {
      method: 'POST',
    }),

  // DELETE YEAR EVENT
  deleteYearEvent: id =>
    request(`/events/yearevent/${id}`, {
      method: 'POST',
    }),

  // POST /api/events/bulk
  bulkAddEvents: events =>
    request('/events/bulk', {
      method: 'POST',
      body: JSON.stringify({ events }),
    }),
};

export default eventsService;
