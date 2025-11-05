const mongoose = require("mongoose");

const PanchaKrushnaSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    sanskritInfo: {
      type: [String],
      required: true,
    },
    marathiInfo: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const PanchaKrushna = mongoose.model("PanchaKrushna", PanchaKrushnaSchema);

module.exports = PanchaKrushna;
