const jwt = require("jsonwebtoken");
const User = require("../models/Auth");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode token ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by decoded ID and attach to request object
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error("Token validation failed:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
