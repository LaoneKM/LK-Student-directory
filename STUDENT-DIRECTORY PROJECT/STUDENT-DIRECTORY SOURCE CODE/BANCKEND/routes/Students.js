  deleteStudent
} = require("../controllers/Studentcontroller");

router.get("/", getStudents);
router.post("/", addStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
