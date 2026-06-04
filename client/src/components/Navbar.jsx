
import { Avatar, Button, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-brand-icon">
            <AutoAwesomeIcon fontSize="small" />
          </div>
          SocialHub
        </div>

        {/* Right side — user info + logout */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "#1976d2",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#374151",
                display: window.innerWidth < 480 ? "none" : "block",
              }}
            >
              {user.username}
            </span>
            <Tooltip title="Logout">
              <Button
                variant="outlined"
                size="small"
                onClick={logout}
                startIcon={<LogoutIcon fontSize="small" />}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  fontSize: 13,
                  borderColor: "#e5e7eb",
                  color: "#6b7280",
                  "&:hover": {
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    bgcolor: "#fff5f5",
                  },
                }}
              >
                Logout
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
