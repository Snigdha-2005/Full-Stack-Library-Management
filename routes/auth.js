const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv } = require("uuid");
const User = require("../models/user");
const { getUser, setUser } = require("../service/auth.js");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, userName, password, role } = req.body;

    if(password.length<8)
      return res.status(400).json({message:"Use a password of at least 8 characters"})
    const email_exists = await User.findOne({ email });
    const userName_exists = await User.findOne({ userName });

    if (email_exists) {
      return res.status(400).json({
        message: "An user with this email already exists!",
      });
    } else if (userName_exists) {
      return res.status(400).json({
        message: "Sorry!!! that userName is taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      userName,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN

router.post("/login", async (req, res) => {
  try {
    const { loginID, password, role } = req.body;
    const user = await User.findOne({
      $or: [{ email: loginID }, { userName: loginID }],
    });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || role !== user.role) {
      return res.status(400).json({ message: "Invalid password or user type" });
    }

    if (getUser(req.cookies?.id)?.role === user.role) {
      return res.redirect("/");
    }

    const generatedSessionID = uuidv();
    setUser(generatedSessionID, user.email, user.role);

    res.cookie("id", generatedSessionID);
    res.cookie("name", user.name);
    return res.redirect("/");
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if(newPassword.length<8)
      return res.status(400).json({message:"Use a password of at least 8 characters"})

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Always hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
