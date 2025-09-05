const express = require("express");
const User = require("../models/user");
const router = express.Router();
const path = require("path");

router.use(["/", "/dashboard"], (req, res) => {
  res.sendFile(path.join(__dirname, "..", "pages", "student-dashboard.html"));
});

router.get("/issued-books", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "pages", "issued-books.html"));
});

router.get("/view-books", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "pages", "view-books.html"));
});
module.exports = router;
