const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { getUser, removeSession } = require("../service/auth.js");
const user = require("../models/user");

async function hashPassword(password) {
  try {
    // bcrypt.hash() takes the password and the salt rounds to generate the hash.
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    return null;
  }
}

// The API function to handle a POST request to add a new user.
async function addUser(req, res) {
  try {
    // 1. Extract user data from the request body
    const { name, userName, email, password, role } = req.body;

    // 2. Create a new instance of the User model
    const newUser = new User({
      name,
      userName,
      email,
      password: await hashPassword(password),
      role,
    });

    // 3. Save the new user document to the database
    const savedUser = await newUser.save();

    // 4. Send a success response with the newly created user (excluding password)
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.__v;
    delete userResponse._id;

    res.status(201).json({
      message: "User added successfully.",
      user: userResponse,
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

    // Check for duplicate key errors (e.g., duplicate userName or email)
    if (err.code === 11000) {
      return res.status(409).json({
        message: "An user with this email or user name already exists.",
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

// The API function to handle a DELETE request to remove a user.
async function removeUser(req, res) {
  try {
    const { userName } = req.params;
    const id = await User.findOne({ userName: userName }).select("_id");

    // 2. Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // 3. Find the user and check for unreturned books
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user has any unreturned books
    const hasUnreturnedBooks = user.issued_books.some((book) => !book.returned);

    if (hasUnreturnedBooks) {
      return res.status(409).json({
        message: "User cannot be removed while they have unreturned books.",
      });
    }

    // 4. If the check passes, delete the user
    const deletedUser = await User.findByIdAndDelete(id).select("-password -__v");
    if (req.cookies?.id && getUser(req.cookies.id)?.email === user.email) {
      console.log(removeSession(req.cookies.id));
    }

    // 5. Send a success response
    res.status(200).json({
      message: "User successfully removed.",
      user: deletedUser, // You can return the deleted document as confirmation
    });
  } catch (err) {
    // 6. Handle any unexpected errors
    res.status(500).json({
      message: "An internal server error occurred.",
      error: err.message,
    });
  }
}

async function getUsers(req, res) {
  try {
    const allUsers = await User.find({}).select("-password -__v");
    res.status(200).json(allUsers); // Send the retrieved users as a JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users from the database.",
    });
  }
}

async function getCurrentUser(req, res) {
  try {
    const sessionId = req.cookies?.id;
    const user = getUser(sessionId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userDetails = await User.findById(user._id).select("-password -__v");
    res.status(200).json(userDetails);
  }
  catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({message: "Error fetching current user.", error: error.message});
  }
}









// A function to update a user by their ID
const modUser = async (req, res) => {
  try {
    const id = await User.findOne({ email: req.body.email }).select("_id");

    const updates = {
      name: req.body.name,
      userName: req.body.userName,
      role: req.body.role,
    };

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    // If no user is found with the provided ID, return a 404 error
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the updated user document in the response
    res.status(200).json(updatedUser);
  } catch (error) {
    // Handle validation errors from the Mongoose schema or other server errors
    res.status(400).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

async function searchUsers(req, res) {
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

    // 3. Create the search criteria to search across name, userName, and email
    const searchCriteria = {
      $or: [
        { name: { $regex: searchRegex } },
        { userName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ],
    };

    // 4. Run two queries concurrently: one for the paginated results, and one for the total count
    const [users, totalCount] = await Promise.all([
      // Query to get the paginated results
      User.find(searchCriteria)
        .skip(skip)
        .limit(limitNumber),
      // Query to get the total count of matching documents
      User.countDocuments(searchCriteria),
    ]);

    // 5. Check if any users were found
    if (totalCount === 0) {
      return res.status(404).json({
        message: "No users found matching your search.",
      });
    }

    // 6. Send a success response
    res.status(200).json({
      message: `${users.length} user(s) found.`,
      page: pageNumber,
      limit: limitNumber,
      totalUsers: totalCount,
      users,
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
  addUser,
  modUser,
  removeUser,
  searchUsers,
  getUsers,
};
