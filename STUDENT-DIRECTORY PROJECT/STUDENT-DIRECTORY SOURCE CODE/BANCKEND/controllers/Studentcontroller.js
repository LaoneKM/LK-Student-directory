const { pool } = require("../db");

const getStudents = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM students");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addStudent = async (req, res) => {
  try {
    const { name, course, email, user_id } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO students (name, course, email, user_id) VALUES (?, ?, ?, ?)",
      [name, course, email, user_id]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      course,
      email,
      user_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM students WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudents,
  addStudent,
  deleteStudent,
};