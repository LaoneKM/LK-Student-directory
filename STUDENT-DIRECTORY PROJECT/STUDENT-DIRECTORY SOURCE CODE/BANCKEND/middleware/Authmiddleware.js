const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers["authorization"];

  // Check if header exists
  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Validate "Bearer <token>" format
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization header format" });
  }

  const token = parts[1];

  // Validate JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Distinguish between different JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    console.error("Authentication error:", err.message);
    res.status(401).json({ message: "Authentication failed" });
  }
};
