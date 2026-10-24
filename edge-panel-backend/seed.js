require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const User = require("./models/User");

const sample = [
  { name: "Aarav Sharma", phone: "+91 98765 43210" },
  { name: "Anita Patel", phone: "+91 91234 56789", favorite: true },
  { name: "Arjun Mehta", phone: "+91 99887 76654" },
  { name: "Bhavana Singh", phone: "+91 87654 32109" },
  { name: "Brandon Roy", phone: "+1 415 555 1234" },
  { name: "Chirag Joshi", phone: "+91 90909 10101" },
];

async function seed() {
  const email = (process.argv[2] || "").toLowerCase();
  if (!email) throw new Error("Usage: npm run seed -- you@example.com");

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email });
  if (!user) throw new Error("No user with that email. Register first.");

  await Contact.deleteMany({ user: { $exists: false } }); // old contacts that belong to nobody
  await Contact.deleteMany({ user: user._id });
  await Contact.insertMany(sample.map((c) => ({ ...c, user: user._id })));

  console.log("Seeded", sample.length, "contacts for", email);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err.message);
  process.exit(1);
});