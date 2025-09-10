const Book = require("../models/book");
const User = require("../models/user");
const mongoose = require("mongoose");

async function issueBook(req, res) {
  try {
    const { isbn, dueDateString } = req.body;
    const userName = req.params.userName;
    let invalidDueDate = false;

    const bookId = await Book.findOne({ isbn }).select("_id");
    const userId = await User.findOne({ userName }).select("_id");

    // 1. Validate the IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({ message: "Invalid user or ISBN." });
    }

    // 2. Find the book and user concurrently
    const [book, user] = await Promise.all([
      Book.findById(bookId).select("-__v -_id"),
      User.findById(userId).select("-password -__v -_id"),
    ]);

    // 3. Check if the book and user exist
    if (!book || !user) {
      return res.status(404).json({
        message: "Either Book or user not found.",
      });
    }

    // 4. Check if the book is available
    if (book.quantity <= 0) {
      return res.status(409).json({
        message: "This title is out of the shelves for now.",
      });
    }
    if (user.issued_books.some((b) => !b.returned && b.isbn == book.isbn)) {
      return res.status(409).json({
        message: "User has already issued this book and not returned it yet.",
      });
    }
    if (user.issued_books.filter((b) => !b.returned).length >= 5) {
      return res.status(409).json({
        message: "User has already issued maximum number of books (5).",
      });
    }

    const issuedDate = new Date();
    let dueDate = new Date(dueDateString);

    if (isNaN(dueDate.getTime())) {
      invalidDueDate = true;
      dueDate = new Date(issuedDate);
      dueDate.setDate(issuedDate.getDate() + 14); // Default to 14 days if invalid
      console.log("invalid date format");
    }
    await Promise.all([
      // Decrement the book's quantity
      Book.findByIdAndUpdate(bookId, { $inc: { quantity: -1 } }, { new: true }),
      // Push the new issued book record to the user's array
      User.findByIdAndUpdate(userId, {
        $inc: { total_issued: 1 },
        $push: {
          issued_books: {
            book_id: bookId,
            issued_date: issuedDate,
            due_date: dueDate,
            author: book.author,
            title: book.title,
            isbn: book.isbn,
            returned_date: null,
          },
        },
      }, { new: true }),
    ]);
    const updatedUser = await User.findById(userId).select("-password -__v -_id");
    if (invalidDueDate) {
      return res.status(200).json({
        message:
          "Book issued successfully with a default 14-day due date due to invalid date format.",
        user: updatedUser,
      });
    }

    res.status(200).json({
      message: "Book issued successfully.",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

// The API function to handle a POST request for returning a book.
async function returnBook(req, res) {
  try {
    const userName = req.params.userName;
    const { isbn, returnDateString } = req.body;

    const bookId = await Book.findOne({ isbn }).select("_id");
    const userId = await User.findOne({ userName }).select("_id");
    const returnDate = new Date(returnDateString);

    if (isNaN(returnDate.getTime())) {
      return res.status(400).json({ message: "Invalid return date format." });
    }

    // 1. Validate the IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({ message: "Invalid user or book ID." });
    }

    // 2. Find the user and the book concurrently
    let [user, book] = await Promise.all([
      User.findById(userId),
      Book.findById(bookId),
    ]);

    // 3. Check if the user and book exist
    if (!book || !user) {
      return res.status(404).json({
        message: "Either Book or user not found.",
      });
    }

    // 4. Find the issued book record in the user's array
    const issuedBookIndex = user.issued_books.findIndex(
      (book) => book.isbn == isbn,
    );

    if (issuedBookIndex === -1) {
      return res.status(404).json({
        message: "This book was not issued to this user.",
      });
    }
    // 5. Remove the issued book from the user's array and increment the book's quantity
    [ book, user] =await Promise.all([
      Book.findByIdAndUpdate(bookId, { $inc: { quantity: 1 } }, { new: true }),
      User.findByIdAndUpdate(userId, {
        $pull: { issued_books: { book_id: bookId } },
      }, { new: true }),
    ]);

    res.status(200).json({ message: "Book returned successfully." });
  } catch (err) {
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

async function renewBook(req, res) {
  try {
    const userName = req.params.userName;
    const { isbn, newDueDateString } = req.body;
    const bookId = await Book.findOne({ isbn }).select("_id");
    const userId = await User.findOne({ userName }).select("_id");
    const newDueDate = new Date(newDueDateString);

    if (isNaN(newDueDate.getTime())) {
      return res.status(400).json({ message: "Invalid new due date format." });
    }
    // 1. Validate the IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({ message: "Invalid user or book ID." });
    }

    // 2. Find the user and the book concurrently
    const [user, book] = await Promise.all([
      User.findById(userId),
      Book.findById(bookId),
    ]);

    // 3. Check if the user and book exist
    if (!book || !user) {
      return res.status(404).json({
        message: "Either Book or user not found.",
      });
    }
    // 4. Find the issued book record in the user's array
    const issuedBookIndex = user.issued_books.findIndex((b) =>
      b.isbn == book.isbn
    );
    if (issuedBookIndex === -1) {
      return res.status(404).json({
        message: "This book was not issued to this user.",
      });
    }
    // 5. Update the due date of the issued book
    user.issued_books[issuedBookIndex].due_date = newDueDate;
    await user.save();
    res.status(200).json({
      message: "Book renewed successfully.",
      issued_books: user.issued_books,
    });
  } catch (err) {
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

module.exports = { issueBook, returnBook, renewBook };
