const User = require("../models/Auth");
const jwt = require("jsonwebtoken");

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

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in registerUser controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

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


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
