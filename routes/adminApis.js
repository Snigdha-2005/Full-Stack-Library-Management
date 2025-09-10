const express=require("express")
const router=express.Router();

const { getBooks,  addBook,  removeBook,  searchBooks,  modBook,} = require("../controllers/book-controller.js");
const { getUsers,  addUser,  removeUser,  modUser,  searchUsers,} = require("../controllers/user-controller.js");
const { issueBook, returnBook, renewBook,} = require("../controllers/issue-return.js");


router.get("/getBooks", getBooks);
router.post("/addBook", addBook);
router.patch("/modBook", modBook);
router.delete("/removeBook/:isbn", removeBook);

router.delete("/removeUser/:userName", removeUser);
router.get("/getUsers", getUsers);
router.patch("/modUser", modUser);
router.post("/addUser", addUser);

router.post("/issue/:userName", issueBook);
router.post("/return/:userName", returnBook);
router.post("/renew/:userName", renewBook);



module.exports=router;


