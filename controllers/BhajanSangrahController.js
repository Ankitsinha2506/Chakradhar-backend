const { default: mongoose } = require("mongoose");
const BhajanSangrah = require("../models/BhajanSangrahModel");

const createBhajanSangrah = async (req, res) => {
  try {
    const { mainTitle, infoTitle, subInfoTitle, content } = req.body;

    const createdBy = req.user?.id; // Get the ID of the logged-in user

    if (!createdBy) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No user information available." });
    }

    // Validation: check if all fields are provided
    if (!mainTitle || !infoTitle || !subInfoTitle || !content) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const bhajanSangrah = await BhajanSangrah.create({
      mainTitle,
      infoTitle,
      subInfoTitle,
      content,
      createdBy,
    });
    res.status(201).json({
      message: "BhajanSangrah created successfully",
      bhajanSangrah,
    });
  } catch (error) {
    console.error("Creation error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getAllBhajanSangrah = async (req, res) => {
  try {
    const bhajanSangrah = await BhajanSangrah.find().populate("createdBy");
    res.status(200).json(bhajanSangrah);
  } catch (error) {
    console.error("Error fetching BhajanSangrah:", error);
    res.status(500).json({ message: "Error fetching BhajanSangrah data." });
  }
};

const updateBhajanSangrah = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainTitle, infoTitle, subInfoTitle, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Parayan ID format" });
    }

    const bhajanSangrah = await BhajanSangrah.findById(id);

    if (!bhajanSangrah) {
      return res.status(404).json({ message: "BhajanSangrah not found" });
    }

    // Check if user is authorized
    if (bhajanSangrah.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to update this BhajanSangrah.",
        });
    }

    // Update fields
    bhajanSangrah.mainTitle = mainTitle || bhajanSangrah.mainTitle;
    bhajanSangrah.infoTitle = infoTitle || bhajanSangrah.infoTitle;
    bhajanSangrah.subInfoTitle = subInfoTitle || bhajanSangrah.subInfoTitle;
    bhajanSangrah.content = content || bhajanSangrah.content;

    await bhajanSangrah.save();
    res
      .status(200)
      .json({ message: "BhajanSangrah updated successfully", bhajanSangrah });
  } catch (error) {
    console.error("Error updating BhajanSangrah:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteBhajanSangrah = async (req, res) => {
  try {
    const { id } = req.params;

    const bhajanSangrah = await BhajanSangrah.findById(id);

    if (!bhajanSangrah) {
      return res.status(404).json({ message: "BhajanSangrah not found" });
    }

    // Check if user is authorized to delete
    if (bhajanSangrah.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this BhajanSangrah." });
    }

    // Use deleteOne instead of remove
    await BhajanSangrah.deleteOne({ _id: id });

    res.status(200).json({ message: "BhajanSangrah deleted successfully" });
  } catch (error) {
    console.error("Error deleting BhajanSangrah:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const findBhajanSangrahbyTitleOrSubtitle = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const bhajan = await BhajanSangrah.find({
      $or: [
        { mainTitle: { $regex: search, $options: "i" } },
        { infoTitle: { $regex: search, $options: "i" } },
        { subInfoTitle: { $regex: search, $options: "i" } },
      ],
    });

    if (bhajan.length === 0) {
      return res.status(404).json({
        message: "No BhajanSangrah data found with the given title or subtitle",
      });
    }

    res.status(200).json(bhajan);
  } catch (error) {
    console.error(
      "Error finding bhajanSangrah data by title or subtitle:",
      error
    );
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBhajanSangrah,
  getAllBhajanSangrah,
  updateBhajanSangrah,
  deleteBhajanSangrah,
  findBhajanSangrahbyTitleOrSubtitle,
};
