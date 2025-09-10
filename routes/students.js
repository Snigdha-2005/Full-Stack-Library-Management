const express = require("express");

const router = express.Router();
const path = require("path");

router.use(["/", "/dashboard"], (req, res) => {
  res.sendFile(path.join(__dirname, "..", "pages", "student-dashboard.html"));
});


router.get("/view-books", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "pages", "view-books.html"));
});
module.exports = router;
