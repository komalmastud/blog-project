// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Route to render the sign-in page
router.get("/signin", (req, res) => {
  return res.render("signin");
});

// Route to render the sign-up page
router.get("/signup", (req, res) => {
  return res.render("signup");
});

// Handle sign-in
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("signin", { error: "User not found" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.render("signin", { error: "Incorrect password" });
    }
    const token = user.generateAuthToken();
    res.cookie("token", token).redirect("/");
  } catch (error) {
    res.render("signin", { error: "An error occurred during sign-in" });
  }
});

// Handle logout
router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

// Handle sign-up
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", { error: "Email already in use" });
    }
    const user = new User({ fullName, email, password });
    await user.save();
    const token = user.generateAuthToken();
    res.cookie("token", token).redirect("/");
  } catch (error) {
    res.render("signup", { error: "An error occurred during sign-up" });
  }
});

module.exports = router;
