require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");

const sample = [
  { name: "Aarav Sharma", phone: "+91 98765 43210" },
  { name: "Anita Patel", phone: "+91 91234 56789", favorite: true },
  { name: "Arjun Mehta", phone: "+91 99887 76654" },
  { name: "Bhavana Singh", phone: "+91 87654 32109" },
  { name: "Brandon Roy", phone: "+1 415 555 1234" },
  { name: "Chirag Joshi", phone: "+91 90909 10101" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Contact.deleteMany({});      // clear old data
  await Contact.insertMany(sample);  // insert sample data
  console.log("Seeded", sample.length, "contacts");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err.message);
  process.exit(1);
});