const mongoose = require("mongoose");

const BhajanSangrahSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
      required: true,
    },
    infoTitle: {
      type: String,
      required: true,
    },
    subInfoTitle: {
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

const BhajanSangrah = mongoose.model("BhajanSangrah", BhajanSangrahSchema);

module.exports = BhajanSangrah;
