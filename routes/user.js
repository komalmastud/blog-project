const express = require("express");
const router = express.Router();

// Use express.Router

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
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    console.log("token", token);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});
router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
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
