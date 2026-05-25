// models/TodayEventModel.js
// Stores events fetched by the daily midnight cron job.
// This collection is wiped and re-populated every night at 12:00 AM IST.
// Sources: Calendarific (national + international) + Google Calendar + CustomEvents

import { Schema, model } from "mongoose";

const todayEventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },

    // Always YYYY-MM-DD for today's events
    date: { type: String, required: true },

    region: {
      type: String,
      enum: [
        "international",
        "national",
        "telangana",
        "india",
        "local",
        "custom",
      ],
      required: true,
      lowercase: true,
    },

    category: { type: String, trim: true, default: "General" },
    emoji: { type: String, default: "🎉" },
    country: { type: String, default: "" },
    tags: [{ type: String }],

    source: {
      type: String,
      enum: [
        "calendarific",
        "google_calendar",
        "local",
        "custom",
        "drik_panchang",
      ],
      default: "local",
    },

    promptHint: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    // YYYY-MM-DD of the day this record was fetched — used to wipe stale data
    fetchDate: { type: String, required: true, index: true },

    // For custom events: reference back to the CustomEvent document
    customEventId: { type: String, default: "" },
  },
  { timestamps: true },
);

todayEventSchema.index({ region: 1 });
todayEventSchema.index({ name: 1, date: 1 }, { unique: true });

export default model("TodayEvent", todayEventSchema);
