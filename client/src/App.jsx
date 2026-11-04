// What this file does: checks login state and renders the shared app shell or login screen.
// When to edit: change the signed-in flow or add app-wide UI.

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header.jsx";
import Board from "./components/Board.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import { getCurrentUser, getSavedAuthToken, setAuthToken } from "./api/taskApi.js";

// Keeps each board hidden until the saved account has been checked.
function App() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [isCheckingLogin, setIsCheckingLogin] = useState(Boolean(getSavedAuthToken()));

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
    setAuthToken("");
    setUser(null);
  }

  // Keeps the app from briefly showing the login form during a session check.
  if (isCheckingLogin) {
    return <main className="auth-loading">Checking your account…</main>;
  }

  return (
    <div className="app">
      {/* Toast notification container mounted globally */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-toast-background)",
            color: "var(--color-toast-text)",
            border: "1px solid var(--color-border)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-toast-success)",
              secondary: "var(--color-toast-background)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-toast-error)",
              secondary: "var(--color-toast-background)",
            },
          },
        }}
      />

      {user ? (
        <>
          <Header user={user} onLogOut={handleLogOut} />
          <div className="app-main">
            <Board key={user.id} />
          </div>
        </>
      ) : (
        <AuthScreen initialErrorMessage={loginError} onAuthenticated={setUser} />
      )}
    </div>
  );
}

export default App;
