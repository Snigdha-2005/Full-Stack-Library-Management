const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const adminRoutes = require("./routes/admin");
const adminApiRoutes = require("./routes/adminApis.js");
const studentApiRoutes = require("./routes/studentApis.js");
// const {addBook}=require("./controllers/book-controller.js")


const { getUser, removeSession } = require("./service/auth.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

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
// app.post("/api/addBook", addBook);

app.use("/api", (req, res, next) => {
  const user = req.cookies?.id && getUser(req.cookies?.id);
  if(user?.role==="admin"){
    return adminApiRoutes(req, res, next)
  }
  else if(user?.role==="student"){
    return studentApiRoutes(req, res, next)
  }
});


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

app.post("/logout", (req, res) => {
  const sessionId = req.cookies?.id;
  removeSession(sessionId);
  res.clearCookie("id");
  res.clearCookie("name");
  return res.redirect("/");
});

app.get("/forget", (req, res) => {
  res.sendFile(path.join(__dirname, "password.html"));
});

app.use("*default", (req, res) => res.redirect("/"));
const PORT = 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
