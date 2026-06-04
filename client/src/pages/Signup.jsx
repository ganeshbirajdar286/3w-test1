import { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { signup } from "../api";
import { useAuth } from "../context/AuthContext";

const Signup = ({ onSwitch }) => {
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await signup(form);
      loginUser(
        { _id: res.data._id, username: res.data.username, email: res.data.email },
        res.data.token
      );
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "#f9fafb",
      "& fieldset": { borderColor: "#e5e7eb" },
      "&:hover fieldset": { borderColor: "#1976d2" },
      "&.Mui-focused fieldset": { borderColor: "#1976d2" },
    },
    "& label.Mui-focused": { color: "#1976d2" },
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <AutoAwesomeIcon fontSize="small" />
          </div>
        </div>
        <h1 className="auth-title">Join SocialHub</h1>
        <p className="auth-subtitle">Create your account to get started</p>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
            inputProps={{ minLength: 3, maxLength: 30 }}
            sx={fieldSx}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            sx={fieldSx}
          />
          <TextField
            label="Password"
            name="password"
            type={showPwd ? "text" : "password"}
            fullWidth
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            helperText="Minimum 6 characters"
            sx={fieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd((v) => !v)} edge="end">
                    {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: 16,
              fontWeight: 700,
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              boxShadow: "0 4px 14px rgba(25,118,210,0.4)",
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Create Account"}
          </Button>
        </form>

        <div className="auth-switch">
          Already have an account?{" "}
          <a onClick={onSwitch}>Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
