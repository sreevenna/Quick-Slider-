require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1); // Render sits behind a proxy

// CLIENT_URL (optional): comma-separated list of allowed sites
const allowed = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: allowed.length ? allowed : true }));
app.use(express.json());

// Slow down password guessing: 50 tries per 15 minutes per IP
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 }));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/contacts", require("./routes/contacts.js"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });