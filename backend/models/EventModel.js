// backend/models/EventModel.js
// Added: dailyFetchDate — set by cron job when fetching today's events.
// Events with dailyFetchDate = yesterday are deleted at next midnight refresh.

import { Schema, model } from "mongoose";

const eventSchema = new Schema({
  name: {
    type: String,
    required: [true, "Event name is required"],
    trim: true,
  },
  description: { type: String, trim: true, default: "" },

  // 'MM-DD' for annual, 'YYYY-MM-DD' for one-time
  date: { type: String, required: true },
  isAnnual: { type: Boolean, default: true },

  region: {
    type: String,
    enum: ["international", "national", "telangana", "custom"],
    required: true,
    lowercase: true,
  },
  category: { type: String, trim: true, default: "General" },
  emoji: { type: String, default: "🎉" },
  tags: [{ type: String }],

  source: {
    type: String,
    enum: ["calendarific", "local", "user", "drik_panchang"],
    default: "local",
  },

  promptHint: { type: String, default: "" },
  isActive: { type: Boolean, default: true },

  // ── NEW: set by daily cron to 'YYYY-MM-DD' of fetch day ─────────────────────
  // Absent on seeded / permanent Telangana events.
  // Cron deletes events where this field exists but != today.
  dailyFetchDate: { type: String, default: null },
});

// Indexes
eventSchema.index({ date: 1, region: 1 });
eventSchema.index({ region: 1, isActive: 1 });
eventSchema.index({ dailyFetchDate: 1 }); // fast cron cleanup

export default model("Event", eventSchema);
