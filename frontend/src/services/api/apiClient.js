// src/services/api/apiClient.js
// Overhaul (Fix #23): axios-style .get/.post/.put/.delete returning { data }
// Storage keys: ONLY 'shubhamai_token' and 'shubhamai_user'

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Canonical storage keys — never change these ───────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: 'shubhamai_token',
  USER:  'shubhamai_user',
};

// ── Base URL ──────────────────────────────────────────────────────────────────
// Android emulator : 'http://10.0.2.2:5000/api'
// iOS simulator    : 'http://localhost:5000/api'
// Physical device  : 'http://<YOUR_LOCAL_IP>:5000/api'
const BASE_URL = 'http://localhost:5000/api';

// ── Helper: get stored JWT ────────────────────────────────────────────────────
const getToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
// Returns { data } on success.
// Throws an error with .response.data shape on failure (mirrors axios behaviour).
const request = async (method, endpoint, body = undefined) => {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkErr) {
    // Network-level failure (no internet, server down, etc.)
    const err = new Error('Network error. Check your connection.');
    err.response = { data: { message: err.message } };
    throw err;
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    responseData = { message: 'Invalid server response.' };
  }

  if (!response.ok) {
    const err = new Error(responseData?.message || 'Something went wrong');
    err.response = { data: responseData };
    throw err;
  }

  // Return in axios-compatible shape so service files read response.data
  return { data: responseData };
};

// ── Public API ────────────────────────────────────────────────────────────────
const apiClient = {
  get:    (endpoint)              => request('GET',    endpoint),
  post:   (endpoint, body)        => request('POST',   endpoint, body),
  put:    (endpoint, body)        => request('PUT',    endpoint, body),
  delete: (endpoint)              => request('DELETE', endpoint),
};

export default apiClient;