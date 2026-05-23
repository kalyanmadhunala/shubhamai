import axios from 'axios';

const CALENDARIFIC_BASE = 'https://calendarific.com/api/v2/holidays';

// ─────────────────────────────────────────────────────────────────────────────
// Fetch holidays from Calendarific API
// type: 'national' | 'local' | 'observance' | 'season' | 'clock_change' | 'optional' | 'un_observance'
// ─────────────────────────────────────────────────────────────────────────────
export const fetchCalendarificHolidays = async ({ country = 'IN', year, month, type } = {}) => {
  const currentYear = year || new Date().getFullYear();
  const currentMonth = month || new Date().getMonth() + 1;

  const params = {
    api_key: process.env.CALENDARIFIC_API_KEY,
    country,
    year: currentYear,
    month: currentMonth,
  };

  if (type) params.type = type;

  const response = await axios.get(CALENDARIFIC_BASE, { params, timeout: 10000 });

  const holidays = response.data?.response?.holidays || [];

  return holidays.map((h) => ({
    name: h.name,
    description: h.description || '',
    date: h.date?.iso || '',
    type: h.type || [],
    country: h.country?.name || '',
    locations: h.locations || 'All',
    states: h.states || 'All',
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// Fetch international holidays (UN-level observances)
// ─────────────────────────────────────────────────────────────────────────────
export const fetchInternationalHolidays = async ({ year, month } = {}) => {
  // Use India as base but filter for internationally recognized days
  const holidays = await fetchCalendarificHolidays({ country: 'IN', year, month });
  return holidays.filter(h =>
    h.type.includes('observance') || h.type.includes('un_observance')
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Fetch national Indian holidays
// ─────────────────────────────────────────────────────────────────────────────
export const fetchNationalHolidays = async ({ year, month } = {}) => {
  const holidays = await fetchCalendarificHolidays({ country: 'IN', year, month });
  return holidays.filter(h =>
    h.type.includes('national') || h.locations === 'All'
  );
};

export default {
  fetchCalendarificHolidays,
  fetchInternationalHolidays,
  fetchNationalHolidays,
};