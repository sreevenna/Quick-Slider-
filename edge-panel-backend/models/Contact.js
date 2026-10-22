const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    favorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    // Send "id" to the frontend instead of "_id" and "__v"
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
      },
    },
  }
);

module.exports = mongoose.model("Contact", contactSchema);