const express=require("express")
const router=express.Router();

const { getBooks,  searchBooks,} = require("../controllers/book-controller.js");
const { getCurrentUser } = require("../controllers/user-controller.js");


router.get("/getBooks", getBooks);
router.get("/myProfile", getCurrentUser);

module.exports=router;