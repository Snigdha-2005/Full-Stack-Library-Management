const express = require('express');
const router = express.Router();
const { addBook, getBooks, searchBooks } = require('../controllers/book-controller.js');
const {getUser} = require('../service/auth.js');


const isAdmin=(req, res, next)=>{

    const user=(req.cookies?.id) && getUser(req.cookies.id);
    const role=user?.role;

    if(role==='admin')
        next();
    else{
        res.json({message:"Only admins can add books!!!"})
    }
}

// // Admin adds book
// router.post('/add', isAdmin, addBook);

// // Get all books
// router.get('/', getBooks);

// // Search books
// router.get('/search', searchBooks);

module.exports = router;