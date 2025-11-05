const mongoose = require("mongoose");

const ParayanSchema = new mongoose.Schema(
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

const Parayan = mongoose.model("Parayan", ParayanSchema);

module.exports = Parayan;
