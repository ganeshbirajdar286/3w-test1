import  { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./index.css";

// MUI theme with custom primary color
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    background: { default: "#f0f2f5" },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

// Inner app — reads auth context
const AppContent = () => {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState("login"); // "login" | "signup"

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
              borderRadius: 14,
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            ✨
          </div>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Loading SocialHub...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show auth screens
  if (!user) {
    if (authPage === "signup") {
      return <Signup onSwitch={() => setAuthPage("login")} />;
    }
    return <Login onSwitch={() => setAuthPage("signup")} />;
  }

  // Logged in — show the feed
  return (
    <>
      <Navbar />
      <main className="page-container">
        <Feed />
      </main>
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
