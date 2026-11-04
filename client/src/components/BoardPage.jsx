// What this file does: combines the signed-in navigation, private board, and optional debug control.
// When to edit: change the board page wrapper or its evaluator-only footer.

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { setSimulateApiFailure } from "../api/taskApi.js";
import Header from "./Header.jsx";
import Board from "./Board.jsx";
import "../styles/BoardPage.css";

// Shows the private board and exposes failure simulation only for explicit debug URLs.
function BoardPage({ user, onLogOut }) {
  const location = useLocation();
  const isDebugMode = new URLSearchParams(location.search).get("debug") === "1";
  const [isFailureSimulationEnabled, setIsFailureSimulationEnabled] = useState(false);

  // Keeps the existing API test switch available for rollback demonstrations.
  function handleFailureSimulationChange(event) {
    setIsFailureSimulationEnabled(event.target.checked);
    setSimulateApiFailure(event.target.checked);
  }

  return (
    <div className="board-page">
      <Header user={user} onLogOut={onLogOut} />
      <div className="app-main">
        <Board key={user.id} />
      </div>
      <footer className="board-footer">
        <span>Kanban Board</span>
        {isDebugMode && (
          <label className="debug-failure-toggle">
            <input
              type="checkbox"
              checked={isFailureSimulationEnabled}
              onChange={handleFailureSimulationChange}
            />
            <span>Debug: failure simulation</span>
          </label>
        )}
      </footer>
    </div>
  );
}

export default BoardPage;
