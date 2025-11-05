const { default: mongoose } = require("mongoose");
const Parayan = require("../models/ParayanModel");

const createParayan = async (req, res) => {
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

    const parayan = await Parayan.create({
      mainTitle,
      infoTitle,
      subInfoTitle,
      content,
      createdBy,
    });
    res.status(201).json({
      message: "Parayan Data created successfully",
      parayan,
    });
  } catch (error) {
    console.error("Creation error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getAllParayan = async (req, res) => {
  try {
    const parayan = await Parayan.find();
    res.status(200).json(parayan);
  } catch (error) {
    console.error("Error fetching Parayan Data:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateParayan = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainTitle, infoTitle, subInfoTitle, content } = req.body;

    // Check if the Parayan ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Parayan ID format' });
    }

    // Find the Parayan document by ID
    const parayan = await Parayan.findById(id);

    // Check if the Parayan exists
    if (!parayan) {
      return res.status(404).json({ message: "Parayan Data not found" });
    }

    // Check if the logged-in user is the creator (createdBy) of the Parayan
    if (parayan.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this information.",
      });
    }

    // Update the Parayan document with the provided data
    parayan.mainTitle = mainTitle || parayan.mainTitle;
    parayan.infoTitle = infoTitle || parayan.infoTitle;
    parayan.subInfoTitle = subInfoTitle || parayan.subInfoTitle;
    parayan.content = content || parayan.content;

    // Save the updated Parayan document
    await parayan.save();

    // Send a success response
    res.status(200).json({
      message: "Parayan Data updated successfully",
      parayan,
    });
  } catch (error) {
    console.error("Error updating Parayan:", error);
    res.status(500).json({ message: "Server error" });
  }
};




const deleteParayan = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if `id` is provided
    if (!id) {
      return res.status(400).json({ message: "ID parameter is missing." });
    }

    // Find the document to delete
    const parayan = await Parayan.findById(id);

    // If the document doesn't exist
    if (!parayan) {
      return res.status(404).json({ message: "Parayan data not found." });
    }

    // Debug: Log the IDs being compared
    console.log("Authenticated User ID:", req.user.id);
    console.log("Created By ID:", parayan.createdBy ? parayan.createdBy.toString() : "undefined");

    // Ensure `createdBy` exists and matches the requesting user's ID
    if (!parayan.createdBy || parayan.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this information." });
    }

    // Proceed to delete the document
    await Parayan.findByIdAndDelete(id);

    res.status(200).json({
      message: "Parayan data deleted successfully.",
      parayan,
    });
  } catch (error) {
    console.error("Error deleting Parayan data:", error);
    res.status(500).json({ message: "Internal Server Error.", error: error.message });
  }
};



const findParayanbyTitleOrSubtitle = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const parayan = await Parayan.find({
      $or: [
        { mainTitle: { $regex: search, $options: "i" } },
        { infoTitle: { $regex: search, $options: "i" } },
        { subInfoTitle: { $regex: search, $options: "i" } },
      ],
    });

    if (parayan.length === 0) {
      return res.status(404).json({
        message: "No Parayan data found with the given title or subtitle",
      });
    }

    res.set('X-Total-Results', parayan.length);
    res.status(200).json(parayan);
  } catch (error) {
    console.error("Error finding Parayan data by title or subtitle:", error);
    res.status(400).json({ message: error.message });
  }
};

const getParayanById = async (req, res) => {
  try {
    const { id } = req.params; // Fetch the ID from the URL params

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const parayan = await Parayan.findById(id); // Find the Parayan by ID

    if (!parayan) {
      return res.status(404).json({ message: 'Parayan not found' });
    }

    res.status(200).json(parayan); // Return the Parayan data
  } catch (error) {
    console.error('Error fetching Parayan data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createParayan,
  getAllParayan,
  updateParayan,
  deleteParayan,
  findParayanbyTitleOrSubtitle,
  getParayanById
};
