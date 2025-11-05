const AartiSangrah = require("../models/AartiSangragModel");

const createAartiSangrah = async (req, res) => {
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

    const aartiSangrah = await AartiSangrah.create({
      mainTitle,
      infoTitle,
      subInfoTitle,
      content,
      createdBy,
    });
    res.status(201).json({
      message: "AartiSangrah created successfully",
      aartiSangrah,
    });
  } catch (error) {
    console.error("Creation error:", error);
    res.status(400).json({ message: error.message });
  }
};


const getAllAartiSangrah = async (req, res) => {
  try {
    const aartiSangrah = await AartiSangrah.find()
    res.status(200).json(aartiSangrah);
  } catch (error) {
    console.error("Error fetching AartiSangrah:", error);
    res.status(500).json({ message: "Error fetching AartiSangrah data." });
  }
};

const updateAartiSangrah = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainTitle, infoTitle, subInfoTitle, content } = req.body;

    const aartiSangrah = await AartiSangrah.findById(id);

    if (!aartiSangrah) {
      return res.status(404).json({ message: "AartiSangrah not found" });
    }

    // Check if user is authorized
    if (aartiSangrah.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this AartiSangrah." });
    }

    // Update fields
    aartiSangrah.mainTitle = mainTitle || aartiSangrah.mainTitle;
    aartiSangrah.infoTitle = infoTitle || aartiSangrah.infoTitle;
    aartiSangrah.subInfoTitle = subInfoTitle || aartiSangrah.subInfoTitle;
    aartiSangrah.content = content || aartiSangrah.content;

    await aartiSangrah.save();
    res.status(200).json({ message: "AartiSangrah updated successfully", aartiSangrah });
  } catch (error) {
    console.error("Error updating AartiSangrah:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteAartiSangrah = async (req, res) => {
  try {
    const { id } = req.params;

    const aartiSangrah = await AartiSangrah.findById(id);

    if (!aartiSangrah) {
      return res.status(404).json({ message: "AartiSangrah not found" });
    }

    // Check if user is authorized to delete
    if (aartiSangrah.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this AartiSangrah." });
    }

    // Use deleteOne instead of remove
    await AartiSangrah.deleteOne({ _id: id });

    res.status(200).json({ message: "AartiSangrah deleted successfully" });
  } catch (error) {
    console.error("Error deleting AartiSangrah:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const findAartiSangrahbyTitleOrSubtitle = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const aarti = await AartiSangrah.find({
      $or: [
        { mainTitle: { $regex: search, $options: "i" } },
        { infoTitle: { $regex: search, $options: "i" } },
        { subInfoTitle: { $regex: search, $options: "i" } },
      ],
    });

    if (aarti.length === 0) {
      return res.status(404).json({
        message: "No AartiSangrah data found with the given title or subtitle",
      });
    }

    res.status(200).json(aarti);
  } catch (error) {
    console.error(
      "Error finding AartiSangrah data by title or subtitle:",
      error
    );
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAartiSangrah,
  getAllAartiSangrah,
  updateAartiSangrah,
  deleteAartiSangrah,
  findAartiSangrahbyTitleOrSubtitle,
};
