const { default: mongoose } = require("mongoose");
const DevPuja = require("../models/DevPujaModel");

const createDevPuja = async (req, res) => {
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

    const devPuja = await DevPuja.create({
      mainTitle,
      subtitle,
      content,
      createdBy,
    });
    res.status(201).json({
      message: "Dev Puja data created successfully",
      devPuja,
    });
  } catch (error) {
    console.error("Creation error:", error);
    res.status(400).json({ message: error.message });
  }
};


const getAllDevPuja = async (req, res) => {
  try {
    const Dev = await DevPuja.find();
    res.status(200).json(Dev);
  } catch (error) {
    console.error("Error fetching Devpuja Data:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateDevPuja = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainTitle, subtitle, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid DevPuja ID format" });
    }

    // Find the DevPuja document by ID
    const devPuja = await DevPuja.findById(id);

    if (!devPuja) {
      return res.status(404).json({ message: "DevPuja data not found" });
    }

    // Check if the logged-in user is the creator (createdBy) of the DevPuja
    if (devPuja.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this information.",
      });
    }

    // Update the DevPuja document with the provided data
    devPuja.mainTitle = mainTitle || devPuja.mainTitle;
    devPuja.subtitle = subtitle || devPuja.subtitle;
    devPuja.content = content || devPuja.content;

    // Save the updated DevPuja document
    await devPuja.save();

    res.status(200).json({
      message: "DevPuja data updated successfully",
      devPuja,
    });
  } catch (error) {
    console.error("Error updating DevPuja:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteDevPuja = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if `id` is provided
    if (!id) {
      return res.status(400).json({ message: "ID parameter is missing." });
    }

    const devPuja = await DevPuja.findById(id);

    if (!devPuja) {
      return res.status(404).json({ message: "DevPuja data not found." });
    }

    console.log("Authenticated User ID:", req.user.id);
    console.log("Created By ID:", devPuja.createdBy ? devPuja.createdBy.toString() : "undefined");

    if (!devPuja.createdBy || devPuja.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this information." });
    }

    await DevPuja.findByIdAndDelete(id);

    res.status(200).json({
      message: "DevPuja data deleted successfully.",
      devPuja,
    });
  } catch (error) {
    console.error("Error deleting DevPuja data:", error);
    res.status(500).json({ message: "Internal Server Error.", error: error.message });
  }
};


const findDevPujabyTitleOrSubtitle = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const Dev = await DevPuja.find({
      $or: [
        { mainTitle: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
      ],
    });

    if (Dev.length === 0) {
      return res
        .status(404)
        .json({ message: "No devpuja data found with the given title or subtitle" });
    }

    res.status(200).json(Dev);
  } catch (error) {
    console.error("Error finding devpuja data by title or subtitle:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createDevPuja,
  getAllDevPuja,
  updateDevPuja,
  deleteDevPuja,
  findDevPujabyTitleOrSubtitle,
};
