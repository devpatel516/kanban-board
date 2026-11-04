// What this file does: the root React component – renders Header, Board, and Toaster.
// When to edit: add a global footer, navigation, or top-level providers.

import { Toaster } from "react-hot-toast";
import Header from "./components/Header.jsx";
import Board from "./components/Board.jsx";

function App() {
  return (
    <div className="app">
      {/* Toast notification container mounted globally */}
      <Toaster position="top-right" />

      {/* Top branding bar */}
      <Header />

      {/* Main Kanban board */}
      <div className="app-main">
        <Board />
      </div>
    </div>
  );
}

export default App;
