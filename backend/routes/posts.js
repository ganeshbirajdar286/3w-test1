import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// File filter — only images
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (paginated, newest first)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Get posts error:", error.message);
    res.status(500).json({ message: "Server error fetching posts" });
  }
});

// @route   POST /api/posts
// @desc    Create a new post (text, image, or both)
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { text } = req.body;
    const imageFile = req.file;

    if (!text?.trim() && !imageFile) {
      return res.status(400).json({ message: "Post must have text or an image" });
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      text: text?.trim() || "",
      image: imageFile ? `/uploads/${imageFile.filename}` : "",
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error.message);
    res.status(500).json({ message: "Server error creating post" });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like or unlike a post (toggle)
router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.map((id) => id.toString()).includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likedBy = post.likedBy.filter((name) => name !== req.user.username);
    } else {
      post.likes.push(req.user._id);
      post.likedBy.push(req.user.username);
    }

    await post.save();
    res.json({ likes: post.likes.length, likedBy: post.likedBy, liked: !alreadyLiked });
  } catch (error) {
    console.error("Like error:", error.message);
    res.status(500).json({ message: "Server error liking post" });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      username: req.user.username,
      userId: req.user._id,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({ comment: newComment, commentsCount: post.comments.length });
  } catch (error) {
    console.error("Comment error:", error.message);
    res.status(500).json({ message: "Server error adding comment" });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post (only by the post owner)
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    if (post.image) {
      const imgPath = path.join(__dirname, "..", post.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Server error deleting post" });
  }
});

export default router;