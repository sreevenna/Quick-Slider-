const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = express.Router();

const isText = (v) => typeof v === "string" && v.trim() !== "";

const makeToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (![name, email, password].every(isText)) {
    return res.status(400).json({ message: "name, email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (await User.findOne({ email: cleanEmail })) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: cleanEmail, passwordHash });
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (![email, password].every(isText)) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));

  if (!ok) {
    return res.status(401).json({ message: "Wrong email or password" });
  }
  res.json({ token: makeToken(user), user: publicUser(user) });
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: "Login required" });
  res.json({ user: publicUser(user) });
});

module.exports = router;