// models/CustomEventModel.js
// Stores user-defined recurring or one-time events.
// These are merged into TodayEvents at every daily cron run if the date matches today.
// Users can delete their custom events from the frontend → DELETE /api/custom-events/:id

import { Schema, model } from 'mongoose';

const customEventSchema = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },

    // 'MM-DD' for annual recurring, 'YYYY-MM-DD' for one-time
    date:     { type: String, required: true },
    isAnnual: { type: Boolean, default: true },

    category:   { type: String, trim: true, default: 'Custom' },
    emoji:      { type: String, default: '📅' },
    tags:       [{ type: String }],
    source: { type: String, default: 'local' },
    country: { type: String, default: 'India' },
    promptHint: { type: String, default: '' },
    isActive:   { type: Boolean, default: true },

  },
);

customEventSchema.index({ date: 1 });
customEventSchema.index({ isActive: 1 });

export default model('CustomEvent', customEventSchema);