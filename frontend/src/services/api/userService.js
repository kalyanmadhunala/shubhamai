// src/services/api/userService.js
// Fix #22: bulkSaveImportantDates sends { dates: [...] } not { importantDates: [...] }
// All user-related API calls: profile, business profile, important dates, saved posters, account

import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export const getProfile = async () => {
  const response = await apiClient.get('/user/profile');
  return response.data; // { success, user }
};

export const updateProfile = async ({ fullName, phone }) => {
  const response = await apiClient.put('/user/profile', { fullName, phone });
  return response.data; // { success, message, user }
};

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export const getBusinessProfile = async () => {
  const response = await apiClient.get('/user/business-profile');
  return response.data; // { success, businessProfile: { businessName, phone, businessAddress } }
};

export const updateBusinessProfile = async ({ businessName, phone, businessAddress }) => {
  const response = await apiClient.put('/user/business-profile', {
    businessName,
    phone,
    businessAddress, // Fix #9: correct field name
  });
  return response.data; // { success, message, businessProfile }
};

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT DATES
// ─────────────────────────────────────────────────────────────────────────────

export const getImportantDates = async () => {
  const response = await apiClient.get('/user/important-dates');
  return response.data; // { success, importantDates: [...] }
};

/**
 * Add a single important date.
 * @param {{ title, date, type, description, category }} dateEntry
 */
export const addImportantDate = async (dateEntry) => {
  const response = await apiClient.post('/user/important-dates', dateEntry);
  return response.data;
};

/**
 * Update a specific important date by its _id.
 */
export const updateImportantDate = async (dateId, dateEntry) => {
  const response = await apiClient.put(`/user/important-dates/${dateId}`, dateEntry);
  return response.data;
};

/**
 * Delete a specific important date by its _id.
 */
export const deleteImportantDate = async (dateId) => {
  const response = await apiClient.delete(`/user/important-dates/${dateId}`);
  return response.data;
};

/**
 * Bulk save/replace entire importantDates array.
 * Fix #22: backend expects { dates: [...] } — NOT { importantDates: [...] }
 * @param {Array} importantDates - array of date objects
 */
export const bulkSaveImportantDates = async (importantDates) => {
  // KEY IS 'dates' — matches backend userController.bulkSaveImportantDates
  const response = await apiClient.post('/user/important-dates/bulk', { dates: importantDates });
  return response.data; // { success, message, importantDates }
};

// ─────────────────────────────────────────────────────────────────────────────
// SAVED POSTERS
// ─────────────────────────────────────────────────────────────────────────────

export const getSavedPosters = async () => {
  const response = await apiClient.get('/user/saved-posters');
  return response.data; // { success, savedPosters: [{ cloudinaryId, imageUrl, eventName, savedAt }] }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE ACCOUNT
// ─────────────────────────────────────────────────────────────────────────────

export const deleteAccount = async () => {
  const response = await apiClient.delete('/user/account');
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  getBusinessProfile,
  updateBusinessProfile,
  getImportantDates,
  addImportantDate,
  updateImportantDate,
  deleteImportantDate,
  bulkSaveImportantDates,
  getSavedPosters,
  deleteAccount,
};