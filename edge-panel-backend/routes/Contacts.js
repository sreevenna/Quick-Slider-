const express = require("express");
const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const router = express.Router();

// Make search text safe for use in a pattern
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/contacts            -> all, A to Z
// GET /api/contacts?q=aar      -> search by name or phone
router.get("/", async (req, res) => {
  const q = escapeRegex(req.query.q || "");

  const contacts = await Contact.find({
    $or: [{ name: new RegExp(q, "i") }, { phone: new RegExp(q) }],
  })
    .sort({ name: 1 })
    .collation({ locale: "en" }); // ignore upper/lower case when sorting

  res.json(contacts);
});

// POST /api/contacts           -> add
router.post("/", async (req, res) => {
  const { name, phone } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ message: "name and phone are required" });
  }

  const contact = await Contact.create({ name, phone });
  res.status(201).json(contact);
});

// PUT /api/contacts/:id        -> update name, phone or favorite
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const { name, phone, favorite } = req.body || {};
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (favorite !== undefined) updates.favorite = favorite;

  const contact = await Contact.findByIdAndUpdate(req.params.id, updates, {
    new: true,            // return the updated version
    runValidators: true,  // apply schema rules
  });

  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json(contact);
});

// DELETE /api/contacts/:id     -> remove
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json({ message: "Deleted" });
});

module.exports = router;