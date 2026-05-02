const { pool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-20 characters (alphanumeric, underscore, hyphen only)"
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const [existingUser] = await pool.execute(
      "SELECT id FROM Users WHERE username = ?",
      [username.toLowerCase()]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists"
      });
    }

    if (email) {
      const [existingEmail] = await pool.execute(
        "SELECT id FROM Users WHERE email = ?",
        [email.toLowerCase()]
      );

      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already registered"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    const [result] = await pool.execute(
      "INSERT INTO Users (username, password, email) VALUES (?, ?, ?)",
      [username.toLowerCase(), hashedPassword, email?.toLowerCase() || null]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user_id: result.insertId,
      username: username.toLowerCase()
    });

  } catch (err) {
    console.error("Registration error:", err);
    
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to register user"
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, username, password, email FROM Users WHERE username = ?",
      [username.toLowerCase()]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        error: "Server configuration error"
      });
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { user_id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: {
        user_id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to login"
    });
  }
}

const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required"
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const [rows] = await pool.execute(
      [decoded.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = rows[0];
    
    const newToken = jwt.sign(
      {
        user_id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: newToken,
      user: {
        user_id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(401).json({
      success: false,
      error: "Failed to refresh token"
    });
  }
};

module.exports = { register, login, refreshTokenHandler };
