// controllers/customEventController.js
//
// Handles user-defined custom events.
//
//   POST   /api/custom-events        → create a custom event
//   GET    /api/custom-events        → list all active custom events
//   DELETE /api/custom-events/:id   → delete a custom event (also removes from TodayEvent)

import CustomEvent from '../models/CustomEventModel.js';
import TodayEvent  from '../models/TodayEventModel.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/custom-events
// Body: { name, description?, date, isAnnual?, category?, emoji?, tags?, promptHint? }
// ─────────────────────────────────────────────────────────────────────────────
export const createCustomEvent = async (req, res) => {
  try {
    const {
      name, description = '', date, isAnnual = true,
      category = 'Custom', emoji = '📅', tags = [],
      promptHint = '', createdBy = 'anonymous',
    } = req.body;

    if (!name || !date) {
      return res.status(400).json({ success: false, message: 'name and date are required.' });
    }

    const customEvent = await CustomEvent.create({
      name, description, date, isAnnual,
      category, emoji, tags, promptHint, createdBy,
    });

    // If the event's date matches today, also inject it into TodayEvent immediately
    // so the frontend doesn't have to wait until next midnight.
    const today      = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayMMDD  = today.substring(5);                      // MM-DD

    const isToday = date === today || date === todayMMDD;

    if (isToday) {
      await TodayEvent.create({
        name, description, date: today,
        region: 'custom', category, emoji, tags, promptHint,
        source: 'custom', isActive: true,
        fetchDate: today,
        customEventId: customEvent._id,
      });
    }

    return res.status(201).json({ success: true, customEvent });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/custom-events
// ─────────────────────────────────────────────────────────────────────────────
export const getCustomEvents = async (req, res) => {
  try {
    const events = await CustomEvent.find({ isActive: true }).sort({ date: 1 });
    return res.json({ success: true, events, total: events.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/custom-events/:id
// Deletes the CustomEvent and removes any TodayEvent entries linked to it.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteCustomEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const customEvent = await CustomEvent.findByIdAndDelete(id);
    if (!customEvent) {
      return res.status(404).json({ success: false, message: 'Custom event not found.' });
    }

    // Remove from TodayEvent if it was injected there
    await TodayEvent.deleteMany({ customEventId: id });

    return res.json({ success: true, message: 'Custom event deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default { createCustomEvent, getCustomEvents, deleteCustomEvent };