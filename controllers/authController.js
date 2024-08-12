const User = require("../models/Auth");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register a new user
const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "Email already used" });
    }

    const verificationCode = crypto.randomBytes(3).toString("hex")

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
      verificationCode,
      isVerified: false
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        message: "Tell the admin to verify your registration"
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in registerUser controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const verifyUser = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the verification code matches
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined; // Clear verification code
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.log("Error in verifyUser controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getAllUsers controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Account not verified. Please verify your account to log in." });
    }

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in loginUser controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Logout
const logoutUser = (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(0), httpOnly: true });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logoutUser controller:", error.message);
    res.status(500).json({ error: "Server error: Unable to log out user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser controller:", error.message);
    res.status(500).json({ error: "Server error: Unable to delete user" });
  }
};



module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  getAllUsers,
  deleteUser,
};
