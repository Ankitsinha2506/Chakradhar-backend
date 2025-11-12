const express = require("express");
const dotenv = require("dotenv").config();
const app = require("./app");
const cors = require("cors");

// ✅ Simple & flexible CORS setup
app.use(
  cors({
    origin: "*", // Use "*" for testing — restrict later to your app domain
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Backend is live ✅");
});

const PORT = process.env.PORT || 5000;

// ✅ Use 0.0.0.0 so Render can expose the server publicly
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
