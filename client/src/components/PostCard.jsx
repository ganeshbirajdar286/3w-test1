import  { useState } from "react";
import {
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Collapse,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { likePost, commentOnPost, deletePost } from "../api";
import { useAuth } from "../context/AuthContext";

// Format relative time
const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};


const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000/";

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(
    post.likes?.includes(user?._id) || false
  );
  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isOwner = user?._id === post.userId;

  const handleLike = async () => {
    try {
      const res = await likePost(post._id);
      setLiked(res.data.liked);
      setLikes(res.data.likes);
      setLikedBy(res.data.likedBy);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentOnPost(post._id, commentText);
      setComments((prev) => [...prev, res.data.comment]);
      setCommentText("");
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setAnchorEl(null);
    try {
      await deletePost(post._id);
      onDelete(post._id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const avatarLetter = post.username?.[0]?.toUpperCase() || "?";

console.log("BASE_URL:", BASE_URL);
console.log("IMAGE URL:", `${BASE_URL}${post.image}`);
  console.log(post.image);
  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="post-user-info">
          <div className="post-avatar">{avatarLetter}</div>
          <div>
            <div className="post-username">@{post.username}</div>
            <div className="post-time">{timeAgo(post.createdAt)}</div>
          </div>
        </div>

        {/* Options menu (visible only to post owner) */}
        {isOwner && (
          <>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: "#9ca3af" }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" } }}
            >
              <MenuItem onClick={handleDelete} sx={{ color: "#ef4444", gap: 1 }}>
                <DeleteOutlinedIcon fontSize="small" />
                Delete Post
              </MenuItem>
            </Menu>
          </>
        )}
      </div>

      {/* Text */}
      {post.text && <p className="post-text">{post.text}</p>}

      {/* Image */}
      {post.image && (
        <img
          className="post-image"
          src={`${BASE_URL}${post.image}`}
          alt="post"
          loading="lazy"
        />
      )}

      {/* Like/Comment actions */}
      <div className="post-actions">
        <Tooltip
          title={likedBy.length > 0 ? likedBy.join(", ") : "Be the first to like!"}
          arrow
        >
          <button
            className={`action-btn ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            {liked ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
            <span className="count">{likes}</span>
          </button>
        </Tooltip>

        <button
          className="action-btn"
          onClick={() => setShowComments((v) => !v)}
        >
          <ChatBubbleOutlinedIcon fontSize="small" />
          <span className="count">{comments.length}</span>
        </button>

        {/* liked by chip */}
        {likedBy.length > 0 && (
          <Chip
            label={
              likedBy.length === 1
                ? `❤️ ${likedBy[0]}`
                : `❤️ ${likedBy[0]} +${likedBy.length - 1}`
            }
            size="small"
            sx={{
              fontSize: 11,
              height: 22,
              bgcolor: "#fff0f0",
              color: "#e53935",
              fontWeight: 600,
              border: "none",
            }}
          />
        )}
      </div>

      {/* Comments Section */}
      <Collapse in={showComments}>
        <div className="comments-section">
          {comments.length === 0 && (
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 10 }}>
              No comments yet. Be the first!
            </p>
          )}

          {comments.map((c, i) => (
            <div key={c._id || i} className="comment-item">
              <div className="comment-avatar">
                {c.username?.[0]?.toUpperCase()}
              </div>
              <div className="comment-bubble">
                <div className="comment-username">@{c.username}</div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          ))}

          {/* Add comment input */}
          {user && (
            <div className="comment-input-row">
              <div className="comment-avatar">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <TextField
                size="small"
                fullWidth
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                disabled={submitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    fontSize: 13,
                    bgcolor: "#f3f4f6",
                    "& fieldset": { border: "none" },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleComment}
                        disabled={!commentText.trim() || submitting}
                        sx={{ color: "#1976d2" }}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default PostCard;
