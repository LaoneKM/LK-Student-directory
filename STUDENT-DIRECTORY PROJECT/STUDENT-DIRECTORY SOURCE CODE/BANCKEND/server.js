const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const db = require("./db");
const authMiddleware = require("./middleware/Authmiddleware");

const app = express();

app.use(helmet()); // Adds various HTTP headers for security

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(morgan("combined"));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const studentRoutes = require("./routes/students");
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);

app.use("/api/students", authMiddleware, studentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Student Directory API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      students: "/api/students",
      health: "/health"
    }
  });
});

app.get("/api/docs", (req, res) => {
  res.json({
    title: "Student Directory API Documentation",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: {
          method: "POST",
          path: "/api/auth/register",
          description: "Register a new user",
          body: {
            username: "string (3-20 chars)",
            password: "string (8+ chars with uppercase, lowercase, number, special char)",
            email: "string (optional)"
          }
        },
        login: {
          method: "POST",
          path: "/api/auth/login",
          description: "Login user",
          body: {
            username: "string",
            password: "string"
          }
        },
        refresh: {
          method: "POST",
          path: "/api/auth/refresh",
          description: "Refresh access token",
          body: {
            refreshToken: "string"
          }
        }
      },
      students: {
        getAll: {
          method: "GET",
          path: "/api/students",
          description: "Get all students (requires auth)",
          auth: true
        },
        add: {
          method: "POST",
          path: "/api/students",
          description: "Add a new student (requires auth)",
          auth: true,
          body: {
            name: "string",
            course: "string",
            email: "string",
            user_id: "number"
          }
        },
        delete: {
          method: "DELETE",
          path: "/api/students/:id",
          description: "Delete a student (requires auth)",
          auth: true
        }
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("❌ ERROR:", {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    status,
    message,
    stack: err.stack
  });

  res.status(status).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === "production" 
        ? "An error occurred" 
        : message,
      status,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    }
  });
});

const initializeDatabase = async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const server = app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`
  🚀 Student Directory API Server    

Environment: ${NODE_ENV.padEnd(25)} 
 Port: ${PORT.toString().padEnd(31)} 
 Status: Running   
  `);
});

process.on("SIGTERM", () => {
  console.log("📋 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Server closed");
    db.end();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("⚠️  SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Server closed");
    db.end();
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = app;
