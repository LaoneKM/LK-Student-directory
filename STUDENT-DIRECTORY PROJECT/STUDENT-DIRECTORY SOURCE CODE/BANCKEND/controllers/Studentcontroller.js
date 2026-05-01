const db = require("../db");


const getStudents = (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const students = rows.map((row) => ({
      id: row.id,        
      name: row.name,       
      course: row.course,
      email: row.email,
    }));

    res.json(students);
  });
};

const addStudent = (req, res) => {
  const { id, name, course, email } = req.body;

  db.run(
    "INSERT INTO students (id, name, course, email) VALUES (?, ?, ?, ?)",
    [id, name, course, email],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({
        id: this.lastID,
        name,
        course,
        email,
      });
    }
  );
};

const deleteStudent = (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM students WHERE student_id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Student deleted" });
    }
  );
};


module.exports = {
  getStudents,
  addStudent,
  deleteStudent,
};