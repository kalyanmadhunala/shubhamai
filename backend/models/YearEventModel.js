// models/YearEventModel.js
// Stores the full-year events fetched once per year on Jan 1 at 00:01 AM IST.
// Sources: Calendarific (national + international) + Google Calendar (all months).
// Persists for the whole year; replaced on the next Jan 1 run.

import { Schema, model } from "mongoose";

const yearEventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },

    // YYYY-MM-DD or MM-DD
    date: { type: String, required: true },
    isAnnual: { type: Boolean, default: true },

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

    // The year this record belongs to — used to wipe previous year's data on refresh
    eventYear: { type: Number, required: true, index: true },
  },
  { timestamps: true },
);

yearEventSchema.index({ date: 1, region: 1 });
yearEventSchema.index({ name: 1, date: 1 }, { unique: true });
yearEventSchema.index({ region: 1, isActive: 1 });

export default model("YearEvent", yearEventSchema);
