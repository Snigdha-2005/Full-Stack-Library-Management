const express=require('express')
const path=require('path')
const { getUser } = require("../service/auth.js");

const router = express.Router();

router.get(["/", "/dashboard"], (req, res) => {
    res.sendFile(path.join(__dirname, "..", "pages", "admin-dashboard.html"));

});
router.get("/manage-books", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "pages", "manage-books.html"));

});
router.get("/manage-students", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "pages", "manage-students.html"));

});
router.get("/issue-return", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "pages", "issue-return.html"));

});
router.get("/manage-allUsers", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "pages", "users.html"));

});







router.use("/dashboard", (req, res) => {
  const user = req.cookies?.id && getUser(req.cookies?.id);
  if (user && user.role === "admin") {
    res.sendFile(path.join(__dirname, "..", "pages", "admin-dashboard.html"));
  } else {
    return res.status(401).send("Unauthorized! Only admins can access this page");
  }
});
























// ➕ Create a student
// router.post("/", isAdmin, async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const student = new User({
//       name,
//       email,
//       password,
//       role: role || "student"
//     });
//     await student.save();
//     res.status(201).json(student);
//   } catch (err) {
//     console.error("❌ Error creating student:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 📌 Get all students
// router.get("/", isAdmin, async (req, res) => {
//   try {
//     const students = await User.find({ role: "student" });
//     res.json(students);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ❌ Delete a student
// router.delete("/:id", isAdmin, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "✅ Student deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });





module.exports= router;