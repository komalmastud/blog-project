// routes/blog.js
const { Router } = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

// Function to ensure folder exists
const ensureDirectoryExists = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }
};

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/uploads";
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Route to render a specific blog post and its comments
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id).populate("createdBy");
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const comments = await Comment.find({ blogId: id }).populate("createdBy");

    console.log("comments", comments);
    console.log("blog", blog);
    res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  } catch (error) {
    console.error("Error fetching blog or comments:", error);
    res.status(500).send("An error occurred while fetching the blog.");
  }
});

// Route to handle file upload and form submission for a new blog
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;
    const coverImageURL = req.file ? `uploads/${req.file.filename}` : null;

    const blog = await Blog.create({
      title,
      body,
      coverImageURL,
    });

    res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).send("An error occurred while creating the blog.");
  }
});

// Route to handle comment submission
router.post("/comment/:blogId", async (req, res) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).send("An error occurred while posting the comment.");
  }
});

module.exports = router;
