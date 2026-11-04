// What this file does: restores the account, configures toast messages, and selects each route.
// When to edit: add a top-level page or change global login and notification behavior.

import { useEffect, useLayoutEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { getCurrentUser, getSavedAuthToken, setAuthToken, setSimulateApiFailure } from "./api/taskApi.js";
import AuthScreen from "./components/AuthScreen.jsx";
import BoardPage from "./components/BoardPage.jsx";
import LandingPage from "./components/LandingPage.jsx";

// Keeps each board hidden until the saved account has been checked.
function App() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [isCheckingLogin, setIsCheckingLogin] = useState(Boolean(getSavedAuthToken()));
  const location = useLocation();
  const isDebugMode = new URLSearchParams(location.search).get("debug") === "1";
  const initialAuthMode = new URLSearchParams(location.search).get("mode") === "login"
    ? "login"
    : "signup";

  // Disable failure simulation as soon as the URL leaves explicit debug mode.
  useLayoutEffect(() => {
    if (!isDebugMode) setSimulateApiFailure(false);
  }, [isDebugMode]);

  // Verify a saved login before showing the user's private board.
  useEffect(() => {
    if (!getSavedAuthToken()) return;

    // Restores the account after a page refresh without showing another login form.
    async function restoreSavedLogin() {
      try {
        const result = await getCurrentUser();
        setUser(result.user);
      } catch (error) {
        setAuthToken("");
        if (error.status !== 401) setLoginError(error.message);
      } finally {
        setIsCheckingLogin(false);
      }
    }

    restoreSavedLogin();
  }, []);

  // Clears the saved token before unmounting the user's private board.
  function handleLogOut() {
    setSimulateApiFailure(false);
    setAuthToken("");
    setUser(null);
  }

  // Keeps the app from briefly showing a page during the saved-session check.
  if (isCheckingLogin) {
    return <main className="auth-loading">Checking your account...</main>;
  }

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-toast-background)",
            color: "var(--color-toast-text)",
            border: "var(--border-width) solid var(--color-border)",
            borderRadius: "var(--radius-small)",
            boxShadow: "var(--shadow-toast)",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
          },
          success: {
            style: { borderLeft: "4px solid var(--color-success)" },
            iconTheme: {
              primary: "var(--color-toast-success)",
              secondary: "var(--color-toast-background)",
            },
          },
          error: {
            style: { borderLeft: "4px solid var(--color-danger)" },
            iconTheme: {
              primary: "var(--color-toast-error)",
              secondary: "var(--color-toast-background)",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/board"
          element={user ? (
            <BoardPage user={user} onLogOut={handleLogOut} />
          ) : (
            <AuthScreen
              initialErrorMessage={loginError}
              initialMode={initialAuthMode}
              onAuthenticated={setUser}
            />
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
