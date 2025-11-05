const mongoose = require("mongoose");

const BhagvatGitaSchema = new mongoose.Schema(
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

const BhagvatGita = mongoose.model("BhagvatGita", BhagvatGitaSchema);

module.exports = BhagvatGita;
