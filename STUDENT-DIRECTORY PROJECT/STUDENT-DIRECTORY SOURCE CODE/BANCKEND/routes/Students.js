const express = require("express");
const router = express.Router();

const {
  getStudents,
  addStudent,
  deleteStudent
} = require("../controllers/Studentcontroller");

router.get("/", getStudents);
router.post("/", addStudent);
router.delete("/:id", deleteStudent);

module.exports = router;