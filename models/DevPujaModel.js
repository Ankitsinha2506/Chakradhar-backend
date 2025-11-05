const mongoose = require("mongoose");

const DevPujaSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    content: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const DevPuja = mongoose.model("DevPuja", DevPujaSchema);

module.exports = DevPuja;
