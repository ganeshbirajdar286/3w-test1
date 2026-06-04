import  { useEffect, useState, useCallback } from "react";
import {
  CircularProgress,
  Button,
  Alert,
  Skeleton,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { getPosts } from "../api";



  // Loading skeletons
  const Skeletons = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <Skeleton variant="circular" width={42} height={42} />
            <div>
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={12} sx={{ mt: 0.5 }} />
            </div>
          </div>
          <Skeleton variant="text" height={14} />
          <Skeleton variant="text" height={14} width="80%" />
          <Skeleton
            variant="rectangular"
            height={180}
            sx={{ borderRadius: 3, mt: 1.5 }}
          />
        </div>
      ))}
    </>
  );

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await getPosts(pageNum, 10);
      const { posts: newPosts, totalPages: tp } = res.data;
      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
      setTotalPages(tp);
      setPage(pageNum);
    } catch (err) {
      setError("Failed to load posts. Please refresh.",err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts(1).finally(() => setLoading(false));
  }, [fetchPosts]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchPosts(page + 1, true);
    setLoadingMore(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };


  return (
    <>
      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              onClick={() => {
                setError("");
                fetchPosts(1);
              }}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Posts */}
      {loading ? (
        <Skeletons />
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No posts yet. Be the first to post!</div>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
          ))}

          {/* Pagination */}
          {page < totalPages && (
            <>
              <Divider sx={{ my: 2 }} />
              <div style={{ textAlign: "center", paddingBottom: 24 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  startIcon={loadingMore && <CircularProgress size={14} />}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    px: 4,
                  }}
                >
                  {loadingMore ? "Loading..." : "Load More Posts"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Feed;
