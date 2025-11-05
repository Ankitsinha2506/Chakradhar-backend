const { default: mongoose } = require("mongoose");
const PanchaKrushna = require("../models/PanchaKrushnaModel");

const createPanchaKrushna = async (req, res) => {
  try {
    const { mainTitle, subtitle, image, sanskritInfo, marathiInfo } = req.body;

    const createdBy = req.user?.id; // Get the ID of the logged-in user

    if (!createdBy) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No user information available." });
    }

    // Validation: check if all fields are provided
    if (!mainTitle || !subtitle || !image || !sanskritInfo || !marathiInfo) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const panchaKrushna = await PanchaKrushna.create({
      mainTitle,
      subtitle,
      image,
      sanskritInfo,
      marathiInfo,
      createdBy,
    });

    res.status(201).json({
      message: "PanchaKrushna Data created successfully",
      panchaKrushna,
    });
  } catch (error) {
    console.error("Creation error:", error);
    res.status(400).json({ message: error.message });
  }
};


const getAllPanchaKrushna = async (req, res) => {
  try {
    const PanchaKrush = await PanchaKrushna.find();
    res.status(200).json(PanchaKrush);
  } catch (error) {
    console.error("Error fetching PanchaKrushna:", error);
    res.status(400).json({ message: error.message });
  }
};

const updatePanchaKrushna = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainTitle, subtitle, image, sanskritInfo, marathiInfo } = req.body;

    // Check if the PanchaKrushna ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid PanchaKrushna ID format' });
    }

    // Find the PanchaKrushna document by ID
    const panchaKrushna = await PanchaKrushna.findById(id);

    // Check if the PanchaKrushna exists
    if (!panchaKrushna) {
      return res.status(404).json({ message: "PanchaKrushna Data not found" });
    }

    // Check if the logged-in user is the creator (createdBy) of the PanchaKrushna
    if (panchaKrushna.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this information.",
      });
    }

    // Update the PanchaKrushna document with the provided data
    panchaKrushna.mainTitle = mainTitle || panchaKrushna.mainTitle;
    panchaKrushna.subtitle = subtitle || panchaKrushna.subtitle;
    panchaKrushna.image = image || panchaKrushna.image;
    panchaKrushna.sanskritInfo = sanskritInfo || panchaKrushna.sanskritInfo;
    panchaKrushna.marathiInfo = marathiInfo || panchaKrushna.marathiInfo;

    // Save the updated PanchaKrushna document
    await panchaKrushna.save();

    // Send a success response
    res.status(200).json({
      message: "PanchaKrushna Data updated successfully",
      panchaKrushna,
    });
  } catch (error) {
    console.error("Error updating PanchaKrushna:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePanchaKrushna = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if `id` is provided
    if (!id) {
      return res.status(400).json({ message: "ID parameter is missing." });
    }

    // Find the document to delete
    const panchaKrushna = await PanchaKrushna.findById(id);

    // If the document doesn't exist
    if (!panchaKrushna) {
      return res.status(404).json({ message: "PanchaKrushna data not found." });
    }

    // Debug: Log the IDs being compared
    console.log("Authenticated User ID:", req.user.id);
    console.log("Created By ID:", panchaKrushna.createdBy ? panchaKrushna.createdBy.toString() : "undefined");

    // Ensure `createdBy` exists and matches the requesting user's ID
    if (!panchaKrushna.createdBy || panchaKrushna.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this information." });
    }

    // Proceed to delete the document
    await PanchaKrushna.findByIdAndDelete(id);

    res.status(200).json({
      message: "PanchaKrushna data deleted successfully.",
      panchaKrushna,
    });
  } catch (error) {
    console.error("Error deleting PanchaKrushna data:", error);
    res.status(500).json({ message: "Internal Server Error.", error: error.message });
  }
};

const findPanchaKrushnabyTitleOrSubtitle = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const PanchaKrush = await PanchaKrushna.find({
      $or: [
        { mainTitle: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
      ],
    });

    if (PanchaKrush.length === 0) {
      return res
        .status(404)
        .json({ message: "No Mantras found with the given title or subtitle" });
    }

    res.status(200).json(PanchaKrush);
  } catch (error) {
    console.error("Error finding Mantras by title or subtitle:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createPanchaKrushna,
  getAllPanchaKrushna,
  updatePanchaKrushna,
  deletePanchaKrushna,
  findPanchaKrushnabyTitleOrSubtitle,
};