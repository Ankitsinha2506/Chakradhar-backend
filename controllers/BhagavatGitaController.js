const { default: mongoose } = require("mongoose");
const BhagavatGita = require("../models/BhagvatGitaModel");

const createBhagavatGita = async (req, res) => {
  try {
    const { mainTitle, subtitle, content } = req.body;

    const createdBy = req.user?.id; // Get the ID of the logged-in user

    if (!createdBy) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No user information available." });
    }

    // Validation: check if all fields are provided
    if (!mainTitle || !subtitle || !content) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const bhagavatGita = await BhagavatGita.create({
      mainTitle,
      subtitle,
      content,
      createdBy,
    });
    res.status(201).json({
      message: "Bhagavat Gita data created successfully",
      bhagavatGita,
    });
  } catch (error) {
    console.error("Creation error:", error);
    res.status(400).json({ message: error.message });
  }
};


const getAllBhagavatGita = async (req, res) => {
  try {
    const gita = await BhagavatGita.find();
    res.status(200).json(gita);
  } catch (error) {
    console.error("Error fetching BhagavatGita Data:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateBhagavatGita = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainTitle, subtitle, content } = req.body;

    // Validate the BhagavatGita ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid BhagavatGita ID format" });
    }

    // Find the BhagavatGita document by ID
    const bhagavatGita = await BhagavatGita.findById(id);

    // Check if the BhagavatGita exists
    if (!bhagavatGita) {
      return res.status(404).json({ message: "BhagavatGita data not found" });
    }

    // Check if the logged-in user is the creator (createdBy) of the BhagavatGita
    if (bhagavatGita.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this information.",
      });
    }

    // Update the BhagavatGita document with the provided data
    bhagavatGita.mainTitle = mainTitle || bhagavatGita.mainTitle;
    bhagavatGita.subtitle = subtitle || bhagavatGita.subtitle;
    bhagavatGita.content = content || bhagavatGita.content;

    // Save the updated BhagavatGita document
    await bhagavatGita.save();

    res.status(200).json({
      message: "BhagavatGita data updated successfully",
      bhagavatGita,
    });
  } catch (error) {
    console.error("Error updating BhagavatGita:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteBhagavatGita = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if `id` is provided
    if (!id) {
      return res.status(400).json({ message: "ID parameter is missing." });
    }

    // Find the BhagavatGita document by ID
    const bhagavatGita = await BhagavatGita.findById(id);

    // Check if the BhagavatGita exists
    if (!bhagavatGita) {
      return res.status(404).json({ message: "BhagavatGita data not found." });
    }

    console.log("Authenticated User ID:", req.user.id);
    console.log("Created By ID:", bhagavatGita.createdBy ? bhagavatGita.createdBy.toString() : "undefined");

    if (!bhagavatGita.createdBy || bhagavatGita.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this information." });
    }

    // Proceed to delete the document
    await BhagavatGita.findByIdAndDelete(id);

    res.status(200).json({
      message: "BhagavatGita data deleted successfully.",
      bhagavatGita,
    });
  } catch (error) {
    console.error("Error deleting BhagavatGita data:", error);
    res.status(500).json({ message: "Internal Server Error.", error: error.message });
  }
};

const findBhagavatGitabyTitleOrSubtitle = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const gita = await BhagavatGita.find({
      $or: [
        { mainTitle: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
      ],
    });

    if (gita.length === 0) {
      return res.status(404).json({
        message: "No BhagavatGita data found with the given title or subtitle",
      });
    }

    res.status(200).json(gita);
  } catch (error) {
    console.error(
      "Error finding BhagavatGita data by title or subtitle:",
      error
    );
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBhagavatGita,
  getAllBhagavatGita,
  updateBhagavatGita,
  deleteBhagavatGita,
  findBhagavatGitabyTitleOrSubtitle,
};
