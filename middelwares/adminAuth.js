const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, "123456"); // Use your actual secret key
    req.user = decoded; // Attach user info (e.g., email) to the request
    next();
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(401).json({ message: "Invalid token." });
  }
};

const isAdminOrSuperAdmin = (req, res, next) => {
  const { email } = req.user;

  // Regular expression to match admin or superadmin email format
  const adminRegex = /^admin[\w\d]*@gmail\.com$/;

  // Check if email matches the admin or superadmin pattern
  if (!adminRegex.test(email) && email !== "superadmin@gmail.com") {
    return res
      .status(403)
      .json({ message: "Access denied. Admins or Superadmins only." });
  }

  next();
};

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // Assuming the token contains the user ID
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = { protect, isAdminOrSuperAdmin, authenticate };
