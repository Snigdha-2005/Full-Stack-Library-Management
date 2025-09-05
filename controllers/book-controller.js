const Book = require("../models/book");
const mongoose = require("mongoose");

async function getBooks(req, res) {
  try {
    // The find() method with an empty object returns all documents in the collection.
    const allBooks = await Book.find({}).select('-__v -_id'); // Exclude the __v field
    res.status(200).json(allBooks);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving books",
      error: error.message,
    });
  }
}

async function addBook(req, res) {
  try {
    // 1. Extract book data from the request body
    const {
      title,
      author,
      isbn,
      genres,
      cover_url,
      publication_year,
      publisher,
      pages,
      quantity,
    } = req.body;

    // 2. Create a new instance of the Book model
    const newBook = new Book({
      title,
      author,
      isbn,
      genres,
      cover_url,
      publication_year,
      publisher,
      pages,
      quantity,
    });

    // 3. Save the new book document to the database
    const savedBook = await newBook.save();
    const bookResponse = savedBook.toObject();
    delete bookResponse.__v;
    delete bookResponse._id;


    // 4. Send a success response with the newly created book
    res.status(201).json({
      message: "Book added successfully.",
      book: bookResponse,
    });
  } catch (err) {
    // 5. Error Handling
    // Check for Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        message: "Validation error",
        errors: messages,
      });
    }

    // Check for duplicate key errors (e.g., duplicate ISBN)
    if (err.code === 11000) {
      return res.status(409).json({
        message: "A book with this ISBN already exists.",
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

// The API function to handle a DELETE request to remove a book.
async function removeBook(req, res) {
  try {
    // 1. Get the book's ID from the URL parameters
    // For a route like app.delete("/api/removeBook/:id", ...)
    const { isbn } = req.params;
    const id=await Book.findOne({isbn:isbn}).select('_id');

    // 2. Validate the ID format (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    // 3. Find the book by its ID and delete it
    const deletedBook = await Book.findByIdAndDelete(id);

    // 4. Check if the book was found and deleted
    if (!deletedBook) {
      // If findByIdAndDelete returns null, no book was found with that ID
      return res.status(404).json({ message: "Book not found." });
    }

    // 5. Send a success response
    res.status(200).json({
      message: "Book successfully removed.",
      book: deletedBook, // You can return the deleted document as confirmation
    });
  } catch (err) {
    // 6. Handle any other unexpected errors
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

// The API function to handle a PATCH request to modify a book.
async function modBook(req, res) {
  try {
    // 1. Get the book's ID from the URL parameters
    const { isbn } = req.body;
    const book=await Book.findOne({isbn:isbn});
    const id=book._id;

    // 2. Get the updated data from the request body
    const updateData = req.body;

    // 3. Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    // 4. Find the book by its ID and update it.
    // The { new: true } option returns the updated document.
    // The { runValidators: true } option ensures Mongoose validation runs on the update.
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    // 5. Check if the book was found
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found." });
    }

    // 6. Send a success response
    res.status(200).json({
      message: "Book successfully updated.",
      book: updatedBook,
    });
  } catch (err) {
    // 7. Error Handling
    // Check for Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        message: "Validation error",
        errors: messages,
      });
    }

    // Check for duplicate key errors (e.g., duplicate ISBN)
    if (err.code === 11000) {
      return res.status(409).json({
        message: "A book with this ISBN already exists.",
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

// The API function to handle a GET request for searching books.
async function searchBooks(req, res) {
  try {
    // 1. Get the search string from the query parameter 'q'
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query 'q' is required." });
    }

    // 2. Create a case-insensitive regular expression for searching
    const searchRegex = new RegExp(q, "i");

    // 3. Find books that match the search string in title, author, or ISBN
    const books = await Book.find({
      $or: [
        { title: { $regex: searchRegex } },
        { author: { $regex: searchRegex } },
        { isbn: { $regex: searchRegex } },
      ],
    });

    // 4. Check if any books were found
    if (books.length === 0) {
      return res.status(404).json({
        message: "No books found matching your search.",
      });
    }

    // 5. Send a success response
    res.status(200).json({
      message: `${books.length} book(s) found.`,
      books,
    });
  } catch (err) {
    // 6. Handle any unexpected errors
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

async function searchBooks(req, res) {
  try {
    // 1. Get the search string, page number, and limit from query parameters
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query 'q' is required." });
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // 2. Create a case-insensitive regular expression for searching
    const searchRegex = new RegExp(q, "i");

    // 3. Create the search criteria
    const searchCriteria = {
      $or: [
        { title: { $regex: searchRegex } },
        { author: { $regex: searchRegex } },
        { isbn: { $regex: searchRegex } },
      ],
    };

    // 4. Run two queries concurrently: one for the paginated results, and one for the total count
    const [books, totalCount] = await Promise.all([
      // Query to get the paginated results
      Book.find(searchCriteria)
        .skip(skip)
        .limit(limitNumber),
      // Query to get the total count of matching documents
      Book.countDocuments(searchCriteria),
    ]);

    // 5. Check if any books were found
    if (totalCount === 0) {
      return res.status(404).json({
        message: "No books found matching your search.",
      });
    }

    // 6. Send a success response
    res.status(200).json({
      message: `${books.length} book(s) found.`,
      page: pageNumber,
      limit: limitNumber,
      totalBooks: totalCount,
      books,
    });
  } catch (err) {
    // 7. Handle any unexpected errors
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

module.exports = {
  // Exporting both functions for a complete controller file
  getBooks,
  addBook,
  removeBook,
  modBook,
  searchBooks,
};
