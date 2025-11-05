const express = require("express");
const dotenv = require("dotenv").config();
const app = require("./app");
const cors = require("cors");

// ✅ Simple & effective CORS setup for development
app.use(
  cors({
    origin: "*", // open during development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const PORT = process.env.PORT || 5000;

// ✅ Expose server to all devices on your LAN
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running at http://192.168.1.108:${PORT}`);
});
