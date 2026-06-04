import { useState, useRef } from "react";
import {
  Button,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";

import SendIcon from "@mui/icons-material/Send";
import { createPost } from "../api";
import { useAuth } from "../context/AuthContext";

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) {
      setError("Please add text or an image to post.");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (image) formData.append("image", image);

    try {
      const res = await createPost(formData);
      onPostCreated(res.data);
      setText("");
      removeImage();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card">
      {/* Header */}
      <div className="create-post-header">
        <div className="post-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <span className="create-post-title">What's on your mind?</span>
      </div>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Text input */}
      <TextField
        multiline
        minRows={2}
        maxRows={5}
        fullWidth
        placeholder={`Share something, ${user?.username}...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            fontSize: 14,
            bgcolor: "#f9fafb",
            "& fieldset": { borderColor: "#e5e7eb" },
            "&:hover fieldset": { borderColor: "#1976d2" },
          },
        }}
        inputProps={{ maxLength: 1000 }}
      />

      {/* Image preview */}
      {preview && (
        <div className="image-preview-wrap">
          <img src={preview} alt="preview" className="image-preview" />
          <button className="image-preview-remove" onClick={removeImage}>
            ✕
          </button>
        </div>
      )}

      {/* Actions row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Tooltip title="Add image">
          <IconButton
            onClick={() => fileRef.current.click()}
            disabled={loading}
            sx={{
              color: "#1976d2",
              "&:hover": { bgcolor: "#e3f2fd" },
            }}
          >
            <ImageIcon />
          </IconButton>
        </Tooltip>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || (!text.trim() && !image)}
          endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
            "&:disabled": { bgcolor: "#93c5fd" },
          }}
        >
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
