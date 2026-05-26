import dotenv from "dotenv";
dotenv.config();

import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import cronRoutes from "./routes/cronRoutes.js";

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  }),
);

app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health Route
app.get("/api/health", (_, res) => {
  return res.send("I am fine");
});

app.get("/", (_, res) => {
  res.send("OK");
});

app.post("/api/admincodecheck", (req, res) => {
  const { admincode } = req.body;
  if (!admincode) {
    return res.status(400).json({
      success: false,
      message: "Activation code is required.",
    });
  }
  try {
    const isMatch = admincode === process.env.ADMIN_CODE;
    if (isMatch) {
      return res.json({
        success: true,
        message: "Admin Activation successful",
      });
    } else {
      return res.json({ success: false, message: "Invalid activation code." });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/cron", cronRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server started");
});
