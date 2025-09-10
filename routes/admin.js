const express=require('express')
const path=require('path')

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
router.get("/manage-allUsers", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "pages", "users.html"));

});



module.exports= router;