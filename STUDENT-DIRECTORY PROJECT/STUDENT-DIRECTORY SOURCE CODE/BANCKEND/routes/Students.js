const { pool } = require("../db");

const getStudents = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    let query = "SELECT * FROM students";
    let params = [];

    if (user_id) {
      query += " WHERE user_id = ?";
      params.push(user_id);
    }

    const [rows] = await pool.execute(query, params);
    
    if (rows.length === 0) {
      return res.json({ message: "No students found", data: [] });
    }

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch students" 
    });
  }
};

const addStudent = async (req, res) => {
  try {
    const { name, course, email, user_id } = req.body;

    if (!name || !course || !email || !user_id) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: name, course, email, user_id" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ 
        success: false,
        message: "Name must be between 2 and 100 characters" 
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM students WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: "A student with this email already exists" 
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO students (name, course, email, user_id) VALUES (?, ?, ?, ?)",
      [name.trim(), course.trim(), email.toLowerCase(), user_id]
    );

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: {
        id: result.insertId,
        name: name.trim(),
        course: course.trim(),
        email: email.toLowerCase(),
        user_id
      }
    });
  } catch (err) {
    console.error("addStudent error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to add student" 
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid student ID" 
      });
    }
    const [student] = await pool.execute(
      "SELECT id FROM students WHERE id = ?",
      [id]
    );

    if (student.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM students WHERE id = ?",
      [id]
    );

    res.json({ 
      success: true,
      message: "Student deleted successfully" 
    });
  } catch (err) {
    console.error("deleteStudent error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete student" 
    });
  }
};

module.exports = {
  getStudents,
  addStudent,
  deleteStudent
};
