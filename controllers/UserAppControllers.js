const User = require("../models/UserAppModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Parayan = require("../models/ParayanModel");
const Devpooja = require("../models/DevPujaModel");
const PanchaKrushna = require("../models/PanchaKrushnaModel");
const BhajanSangrah = require("../models/BhajanSangrahModel");
const BhagavatGita = require("../models/BhagvatGitaModel");
const AartiSangrah = require("../models/AartiSangragModel");
const BhagvatGita = require("../models/BhagvatGitaModel");
const nodemailer = require("nodemailer");
const OTP = require("../models/OTPModel"); 
// const { default: mongoose } = require("mongoose");
const OTPphone = require('../models/OTPPhoneNoModel'); // Import OTPphone model
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendphoneOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const message = `Your OTP code is: ${otp}`;

    // Send OTP via Twilio
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    // Save OTP to the database (optional)
    const otpRecord = new OTPphone({
      phoneNumber,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
    });
    await otpRecord.save();

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyphoneOtp = async (req, res) => {
  const { phoneNumber, otp, enteredOtp } = req.body;

  if (!phoneNumber || !otp || !enteredOtp) {
    return res.status(400).json({ message: 'Phone number, OTP, and entered OTP are required' });
  }

  try {
    // Find OTP record for the phone number
    const otpRecord = await OTPphone.findOne({ phoneNumber, otp });
    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP not found' });
    }

    // Check if OTP has expired
    if (Date.now() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check if entered OTP matches the generated OTP
    if (otpRecord.otp !== enteredOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};


const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Prevent admins from creating other admin users
    const isAdminEmail = /^admin[\w\d]*@gmail\.com$/.test(email);
    if (isAdminEmail) {
      return res.status(403).json({
        message: "Admins are not allowed to create other admin users.",
      });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Create the new user
    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    // Respond with success and the details of the newly created user
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error during user creation:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user is authenticated (either admin or regular user)
    const createdBy = req.user?.id || null; // The ID of the user creating the new user
    const creatorEmail = req.user?.email || null;

    // Validate input fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Prevent admins from creating other admin users
    const isAdminEmail = /^admin[\w\d]*@gmail\.com$/.test(email);
    if (isAdminEmail && !creatorEmail) {
      return res.status(403).json({
        message: "Only authenticated admins can create admin users.",
      });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Create the new user
    const newUser = new User({
      name,
      email,
      password,
      createdBy, // Reference to the user who created the new user
    });

    await newUser.save();

    // Respond with success and the details of the newly created user
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdBy: createdBy ? { id: createdBy, email: creatorEmail } : null, // Track the creator
      },
    });
  } catch (error) {
    console.error("Error during user creation:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const createdBy = req.user?.id;
    const creatorEmail = req.user?.email;

    if (!creatorEmail || creatorEmail !== "superadmin@gmail.com") {
      return res
        .status(403)
        .json({ message: "Only the superadmin can create admin users." });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailPattern = /^admin[\w\d]*@gmail\.com$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message:
          "Invalid email format. Admin email should follow the pattern like admin1@gmail.com.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }
    const newUser = new User({
      name,
      email,
      password,
      createdBy,
    });

    await newUser.save();

    res.status(201).json({
      message: "Admin user created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdBy: newUser.createdBy,
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id, email }, "123456", {
      expiresIn: "5h",
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user._id, email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getUser = async (req, res) => {
  try {
    const loggedInUserEmail = req.user?.email?.trim().toLowerCase(); // Get logged-in user's email and trim any spaces

    console.log("Logged in user's email:", loggedInUserEmail); // Debugging log to check the email

    // Fetch all users and populate the "createdBy" field
    const allUsers = await User.find().populate("createdBy", "name email");

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    // Pattern for admin emails (this includes admin1@example.com, admin2@example.com, etc.)
    const adminEmailPattern = /^admin[\w\d]*@gmail\.com$/;
    const superadminEmail = "superadmin@gmail.com"; // Superadmin email

    let users;

    // Superadmin can see all users
    if (loggedInUserEmail === superadminEmail) {
      users = allUsers;
    } else if (adminEmailPattern.test(loggedInUserEmail)) {
      // Admin sees only non-admin users (exclude superadmin and admin emails)
      users = allUsers
        .filter((user) => {
          return (
            user.email !== superadminEmail &&
            !adminEmailPattern.test(user.email)
          ); // Exclude superadmin and admin emails
        })
        .map((user) => ({ email: user.email })); // Return only email
    } else {
      // Regular user sees only non-admin users (exclude superadmin and admin emails)
      users = allUsers
        .filter((user) => {
          return (
            user.email !== superadminEmail &&
            !adminEmailPattern.test(user.email)
          ); // Exclude superadmin and admin emails
        })
        .map((user) => ({ email: user.email })); // Return only email
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, newEmail, password } = req.body;
    const userEmail = req.user?.email;
    const adminEmailPattern = /^admin[\w\d]*@gmail\.com$/;

    if (
      userEmail !== email &&
      !(
        userEmail === "superadmin@gmail.com" ||
        adminEmailPattern.test(userEmail)
      )
    ) {
      return res
        .status(403)
        .json({ message: "You can only update your own account." });
    }

    const updatedData = { name };
    if (newEmail) updatedData.email = newEmail;
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findOneAndUpdate({ email }, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { email } = req.params; // Extract email from request params
    const userEmail = req.user?.email; // Get the logged-in user's email

    // Define the admin email pattern (e.g., admin1@example.com, admin2@example.com)
    const adminEmailPattern = /^admin[\w\d]*@gmail\.com$/;

    // Allow only the user themselves or superadmins to update
    if (
      userEmail !== email &&
      !(
        userEmail === "superadmin@gmail.com" ||
        adminEmailPattern.test(userEmail)
      )
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own account." });
    }

    if (email === "superadmin@gmail.com") {
      return res
        .status(403)
        .json({ message: "Superadmin cannot delete their own account." });
    }

    // Check if the email exists and delete the user by email
    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: error.message });
  }
};

const findbyMainTitle = async (req, res) => {
  try {
    const [
      parayan,
      devpooja,
      panchaKrushna,
      bhajanSangrah,
      bhagavatGita,
      aartiSangrah,
    ] = await Promise.all([
      Parayan.find({}).select("mainTitle"),
      Devpooja.find({}).select("mainTitle"),
      PanchaKrushna.find({}).select("mainTitle"),
      BhajanSangrah.find({}).select("mainTitle"),
      BhagavatGita.find({}).select("mainTitle"),
      AartiSangrah.find({}).select("mainTitle"),
    ]);

    const allMainTitle = [
      ...parayan.map((item) => item.mainTitle),
      ...devpooja.map((item) => item.mainTitle),
      ...panchaKrushna.map((item) => item.mainTitle),
      ...bhajanSangrah.map((item) => item.mainTitle),
      ...aartiSangrah.map((item) => item.mainTitle),
      ...bhagavatGita.map((item) => item.mainTitle),
    ];

    const uniqueMainTitle = [...new Set(allMainTitle)];

    res.json(uniqueMainTitle);
  } catch (error) {
    console.error("Error fetching main titles:", error);
    res.status(500).json({ message: "Error fetching main titles", error });
  }
};

const findParayanInfoTitles = async (req, res) => {
  try {
    const parayan = await Parayan.find({}).select("infoTitle");

    const parayanInfoTitles = parayan.map((item) => item.infoTitle);
    const uniqueInfoTitles = [...new Set(parayanInfoTitles)];

    res.json(uniqueInfoTitles);
  } catch (error) {
    console.error("Error fetching Parayan infoTitles:", error);
    res
      .status(500)
      .json({ message: "Error fetching Parayan infoTitles", error });
  }
};

const findAartiSangrahInfoTitles = async (req, res) => {
  try {
    const aarti = await AartiSangrah.find({}).select("infoTitle");

    const aartiInfoTitles = aarti.map((item) => item.infoTitle);
    const uniqueaartiInfoTitles = [...new Set(aartiInfoTitles)];

    res.json(uniqueaartiInfoTitles);
  } catch (error) {
    console.error("Error fetching AartiSangrah infoTitles:", error);
    res
      .status(500)
      .json({ message: "Error fetching AartiSangrah infoTitles", error });
  }
};

const findBhaganSangrahInfoTitles = async (req, res) => {
  try {
    const bhajan = await BhajanSangrah.find({}).select("infoTitle");

    const bhajanInfoTitles = bhajan.map((item) => item.infoTitle);
    const uniquebhajanInfoTitles = [...new Set(bhajanInfoTitles)];


    res.json(uniquebhajanInfoTitles);
  } catch (error) {
    console.error("Error fetching BhajanSangrah infoTitles:", error);
    res
      .status(500)
      .json({ message: "Error fetching BhajanSangrah infoTitles", error });
  }
};

const findParayanSubinfoTitles = async (req, res) => {
  const { infoTitle } = req.params;

  try {
    // Find all documents with the given infoTitle
    const parayanDocuments = await Parayan.find({ infoTitle }).select(
      "subInfoTitle"
    );

    if (parayanDocuments.length === 0) {
      return res.status(404).json({
        message: "No subInfoTitles found for this infoTitle in Parayan",
      });
    }

    // Extract subInfoTitle from all matching documents
    const parayansubInfoTitles = parayanDocuments.map(
      (document) => document.subInfoTitle
    );

    // If each subInfoTitle is a string, wrap it in an array for consistency
    const allSubInfoTitles = parayansubInfoTitles.flat();

    const uniqueInfoTitles = [...new Set(allSubInfoTitles)];

    // Return the collected subInfoTitles
    res.json(uniqueInfoTitles);
  } catch (error) {
    console.error("Error fetching subInfoTitles:", error);
    res.status(500).json({ message: "Error fetching subInfoTitles", error });
  }
};

const findParayanContentBySubInfoTitle = async (req, res) => {
  const { subInfoTitle } = req.params;

  try {
    // Find the document in the Parayan collection that matches the subInfoTitle
    const parayanDocument = await Parayan.findOne({
      subInfoTitle: subInfoTitle,
    }).select("content");

    if (!parayanDocument) {
      return res.status(404).json({
        message: "No content found for the given subInfoTitle in Parayan.",
      });
    }

    // Extract content
    const { content } = parayanDocument;

    res.json({ content });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      message: "An error occurred while fetching content.",
      error,
    });
  }
};

const findBhajanSubinfoTitles = async (req, res) => {
  const { infoTitle } = req.params;

  try {
    const bhajanDocuments = await BhajanSangrah.find({ infoTitle }).select(
      "subInfoTitle"
    );

    if (bhajanDocuments.length === 0) {
      return res.status(404).json({
        message: "No subInfoTitle found for this infoTitle in BhajanSangrah",
      });
    }

    const bhajansubInfoTitles = bhajanDocuments.map(
      (document) => document.subInfoTitle
    );

    const allBhajanSubInfoTitles = bhajansubInfoTitles.flat();

    // Optionally, remove duplicates using Set
    const uniqueInfoTitles = [...new Set(allBhajanSubInfoTitles)];

    // Return the result
    res.json(uniqueInfoTitles);
  } catch (error) {
    console.error("Error fetching subInfoTitles:", error);
    res.status(500).json({ message: "Error fetching subInfoTitles", error });
  }
};

const findBhajanContentBySubInfoTitle = async (req, res) => {
  const { subInfoTitle } = req.params;

  try {
    const bhajanDocument = await BhajanSangrah.findOne({
      subInfoTitle: subInfoTitle,
    }).select("content");

    if (!bhajanDocument) {
      return res.status(404).json({
        message:
          "No content found for the given subInfoTitle in BhajanSangrah.",
      });
    }

    const { content } = bhajanDocument;

    res.json({ content });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      message: "An error occurred while fetching content.",
      error,
    });
  }
};

const findAartiSubinfoTitles = async (req, res) => {
  const { infoTitle } = req.params;

  try {
    const aartiDocuments = await AartiSangrah.find({ infoTitle }).select(
      "subInfoTitle"
    );

    if (aartiDocuments.length === 0) {
      return res.status(404).json({
        message: "No subInfoTitle found for this infoTitle in AartiSangrah",
      });
    }

    const aartisubInfoTitles = aartiDocuments.map(
      (document) => document.subInfoTitle
    );

    const allAartiSubInfoTitles = aartisubInfoTitles.flat();

    // Optionally, remove duplicates using Set
    const uniqueInfoTitles = [...new Set(allAartiSubInfoTitles)];

    // Return the result
    res.json(uniqueInfoTitles);
  } catch (error) {
    console.error("Error fetching subInfoTitles:", error);
    res.status(500).json({ message: "Error fetching subInfoTitles", error });
  }
};

const findAartiContentBySubInfoTitle = async (req, res) => {
  const { subInfoTitle } = req.params;

  try {
    const aartiDocument = await AartiSangrah.findOne({
      subInfoTitle: subInfoTitle,
    }).select("content");

    if (!aartiDocument) {
      return res.status(404).json({
        message: "No content found for the given subInfoTitle in AartiSangrah.",
      });
    }

    // Extract content
    const { content } = aartiDocument;

    res.json({ content });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      message: "An error occurred while fetching content.",
      error,
    });
  }
};

const findBhagavatGitaSubTitles = async (req, res) => {
  try {
    const bhagavatGita = await BhagvatGita.find({}).select("subtitle");

    const BhagvatGitaSubTitle = bhagavatGita.map((item) => item.subtitle);
    const uniqueSubTitles = [...new Set(BhagvatGitaSubTitle)];

    res.json(uniqueSubTitles);
  } catch (error) {
    console.error("Error fetching BhagavatGita Subtitles:", error);
    res
      .status(500)
      .json({ message: "Error fetching BhagavatGita Subtitles", error });
  }
};

const findBhagvatGitaContentBySubTitle = async (req, res) => {
  const { subtitle } = req.params;

  try {
    const bhagvatGitaDocument = await BhagvatGita.findOne({
      subtitle: subtitle,
    }).select("content");

    if (!bhagvatGitaDocument) {
      return res.status(404).json({
        message: "No content found for the given subTitle in BhagvatGita.",
      });
    }

    // Extract content
    const { content } = bhagvatGitaDocument;

    res.json({ content });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      message: "An error occurred while fetching content.",
      error,
    });
  }
};

const findDevPoojaSubTitles = async (req, res) => {
  try {
    const dev = await Devpooja.find({}).select("subtitle");

    const DevSubTitles = dev.map((item) => item.subtitle);
    const uniqueSubTitles = [...new Set(DevSubTitles)];

    res.json(uniqueSubTitles);
  } catch (error) {
    console.error("Error fetching Devpooja Subtitles:", error);
    res
      .status(500)
      .json({ message: "Error fetching DevPooja Subtitles", error });
  }
};

const findDevPoojaContentBySubTitle = async (req, res) => {
  const { subtitle } = req.params;

  try {
    const DevPoojaDocument = await Devpooja.findOne({
      subtitle: subtitle,
    }).select("content");

    if (!DevPoojaDocument) {
      return res.status(404).json({
        message: "No content found for the given subTitle in Devpooja.",
      });
    }

    // Extract content
    const { content } = DevPoojaDocument;

    res.json({ content });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      message: "An error occurred while fetching content.",
      error,
    });
  }
};

const findPanchaKrushnaSubTitles = async (req, res) => {
  try {
    const panchaKrushna = await PanchaKrushna.find({}).select("subtitle");

    const panchaKrushnaSubTitles = panchaKrushna.map((item) => item.subtitle);
    const uniqueSubTitles = [...new Set(panchaKrushnaSubTitles)];

    res.json(uniqueSubTitles);
  } catch (error) {
    console.error("Error fetching PanchaKrushna Subtitles:", error);
    res
      .status(500)
      .json({ message: "Error fetching PanchaKrushna Subtitles", error });
  }
};

const findPanchaKrushnaContentBySubtitle = async (req, res) => {
  try {
    const { subtitle } = req.params;

    const panchaKrushna = await PanchaKrushna.findOne({ subtitle }).select(
      "image sanskritInfo marathiInfo"
    );

    if (!panchaKrushna) {
      return res.status(404).json({ message: "Subtitle not found" });
    }

    res.json({
      image: panchaKrushna.image,
      sanskritInfo: panchaKrushna.sanskritInfo,
      marathiInfo: panchaKrushna.marathiInfo,
    });
  } catch (error) {
    console.error("Error fetching content for subtitle:", error);
    res
      .status(500)
      .json({ message: "Error fetching content for subtitle", error });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check that the required fields are provided
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    // Prepare the data to update
    const updatedData = { name };

    // If password is provided, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    // Update user profile in the database
    const updatedUser = await User.findOneAndUpdate({ email }, updatedData, {
      new: true, // Return the updated user
      runValidators: true, // Ensure validators are respected
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Respond with success and the updated user details
    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const sendOtp = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  // Save OTP to database (Assuming you have an OTP model)
  const otpRecord = new OTP({ email, otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // OTP expires in 10 minutes
  await otpRecord.save();

  // Set up the transporter for email sending
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "atharvabhokare140@gmail.com",
      pass: "ejec yabf tzvb qaee",
    },
  });

  const mailOptions = {
    from: "atharvabhokare140@gmail.com",
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Error sending OTP" });
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).json({ message: "OTP sent to email" });
    }
  });
};
   
const updatePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find OTP record from DB
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP is invalid or expired" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the password (pre-save hook will handle hashing)
    user.password = newPassword;

    // Save the updated user
    await user.save();

    // Delete OTP record after use
    await OTP.deleteOne({ email, otp });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Something went wrong while updating the password" });
  }
};


module.exports = {
  signUp,
  sendOtp,
  updatePassword,
  updateUserProfile,
  adminCreateUser,
  createUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  findbyMainTitle,
  findParayanInfoTitles,
  findAartiSangrahInfoTitles,
  findBhaganSangrahInfoTitles,
  findParayanSubinfoTitles,
  findParayanContentBySubInfoTitle,
  findBhajanSubinfoTitles,
  findBhajanContentBySubInfoTitle,
  findAartiSubinfoTitles,
  findAartiContentBySubInfoTitle,
  findBhagavatGitaSubTitles,
  findBhagvatGitaContentBySubTitle,
  findDevPoojaSubTitles,
  findDevPoojaContentBySubTitle,
  findPanchaKrushnaSubTitles,
  findPanchaKrushnaContentBySubtitle,
  sendphoneOtp,
  verifyphoneOtp
};
