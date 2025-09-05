const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  issued_books: [
    {
      book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      author: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      isbn: {
        type: String,
        required: true,
      },
      issued_date: {
        type: Date,
        required: true,
        default: Date.now,
      },
      due_date: {
        type: Date,
        required: true,
      },
      returned: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase();
  }
  if (this.isModified("userName")) {
    this.userName = this.userName.toLowerCase();
  }

  if (
    !this.isNew && (this.isModified("email") || this.isModified("userName"))
  ) {
    try {
      const existingUser = await this.constructor.findOne({
        $or: [{ email: this.email }, { userName: this.userName }],
        _id: { $ne: this._id }, // Exclude the current document from the search
      });
      if (!existingUser) {
        return next();
      } else {
        return next(new Error("Email or Username already in use"));
      }
    } catch (error) {
      return next(error);
    }
  }
});

// ✅ Prevent "OverwriteModelError"
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
