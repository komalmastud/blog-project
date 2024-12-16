const express = require("express");
const User = require("../models/user"); // Assuming you have a User model defined

// Use express.Router
const router = express.Router();

// Route to render the sign-in page
router.get("/signin", (req, res) => {
  return res.render("signin"); // Renders the 'signin' view
});

// Route to render the sign-up page
router.get("/signup", (req, res) => {
  return res.render("signup"); // Renders the 'signup' view
});
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const user = await User.matchPassword(email, password);
  console.log("User", user);
  return res.redirect("/");
});
// Route to handle sign-up form submissions
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Create a new user in the database
    await User.create({
      fullName,
      email,
      password,
    });

    // Redirect to the home page or another desired route
    return res.redirect("/");
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("An error occurred while signing up.");
  }
});

// Export the router so it can be used in other files
module.exports = router;
