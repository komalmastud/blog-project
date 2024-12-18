const { Router } = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = Router();
const Blog = require("../models/blog");

// Function to Ensure Folder Exists
const ensureDirectoryExists = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true }); // Create the directory recursively
  }
};

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Validate if req.user exists
    if (!req.user || !req.user._id) {
      return cb(new Error("User not authenticated"), null);
    }

    // Create dynamic path based on user ID
    const uploadPath = `./public/uploads/${req.user._id}`;
    ensureDirectoryExists(uploadPath); // Ensure the folder exists

    cb(null, uploadPath); // Pass the upload path to Multer
  },
  filename: function (req, file, cb) {
    // Generate unique file name
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

// Initialize Multer Middleware
const upload = multer({ storage: storage });

// Route: Render Add New Blog Page
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

// Route: Handle File Upload and Form Submission
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;

    // Create a new blog post
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: `uploads/${req.user._id}/${req.file.filename}`,
    });

    console.log("Blog created successfully");
    console.log(req.body); // Logs form fields
    console.log(req.file); // Logs uploaded file details

    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    return res.status(500).send("An error occurred while creating the blog.");
  }
});

module.exports = router;
