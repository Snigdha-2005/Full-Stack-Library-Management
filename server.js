const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/book");
const studentRoutes = require("./routes/students");
const adminRoutes = require("./routes/admin");

const {getBooks, addBook, removeBook, searchBooks, modBook}=require("./controllers/book-controller.js")
const {getUsers, addUser, removeUser, modUser, searchUsers}=require("./controllers/user-controller.js")
const userController=require("./controllers/user-controller.js")
const {issueBook, returnBook, renewBook}=require("./controllers/issue-return.js")



const { getUser, removeSession } = require("./service/auth.js");

const app = express();

// // Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/libraryDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const isAuthenticated = (role) => {
  return (req, res, next) => {
    try {
      const user = req.cookies?.id && getUser(req.cookies.id);
      if (user && user.role === role) next();
      else {
        removeSession(req.cookies?.id);
        res.clearCookie("id");
        res.clearCookie("name");
        return res.redirect("/");
      }
    } catch (e) {
      res.status(500).json({ message: "Server error" });
    }
  };
};

const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

app.use("/auth", authRoutes);
app.use("/admin", isAuthenticated("admin"), adminRoutes);
app.use("/student", isAuthenticated("student"), studentRoutes);



app.get(["/", "/login"], (req, res) => {
  const user = getUser(req.cookies?.id);
  if (user) {
    return user.role === "admin"
      ? res.redirect("/admin")
      : res.redirect("/student");
  }
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/register", (req, res) => {
  const user = getUser(req.cookies?.id);
  if (user) return redirect("/");

  res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/logout", (req, res) => {
  const sessionId = req.cookies?.id;
  removeSession(sessionId);
  res.clearCookie("id");
  res.clearCookie("name");
  return res.redirect("/");
});

app.get("/forget", (req, res) => {
  res.sendFile(path.join(__dirname, "password.html"));
});

app.get("/api/getBooks", getBooks);
app.post("/api/addBook", addBook);
app.patch("/api/modBook", isAuthenticated("admin"), modBook);
app.delete("/api/removeBook/:isbn", isAuthenticated("admin"), removeBook);

app.delete("/api/removeUser/:userName", isAuthenticated("admin"), removeUser);
app.get("/api/getUsers", getUsers);
app.patch("/api/modUser", isAuthenticated("admin"), modUser);
app.post("/api/addUser", isAuthenticated("admin"), addUser);

app.post("/api/issue/:userName", isAuthenticated("admin"), issueBook)
app.post("/api/return/:userName", isAuthenticated("admin"), returnBook)
app.post("/api/renew/:userName", isAuthenticated("admin"), renewBook)



app.use("*default", (req, res) => res.redirect("/"));
const PORT = 5000;

app.listen(
  PORT,
  () => console.log(`🚀 Server running at http://localhost:${PORT}`),
);
