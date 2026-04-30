const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db"); 

const app = express();

app.use(cors());
app.use(express.json());

const studentRoutes = require("./routes/students");
const authRoutes = require("./routes/auth");

app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/test-students", (req, res) => {
  res.send("Students route is working");
});

app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});