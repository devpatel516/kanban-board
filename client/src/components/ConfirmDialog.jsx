// What this file does: accessible confirmation dialog to prevent accidental task deletions.
// When to edit: customize warning copy or add another action confirmation.

import { useEffect, useRef } from "react";
import { XIcon } from "./Icons.jsx";
import "../styles/ConfirmDialog.css";

function ConfirmDialog({ isOpen, title = "Delete Task", message, onConfirm, onCancel }) {
  // Focus the cancel button on open so pressing enter by accident doesn't delete
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Accessibility: Pressing Escape cancels and closes the dialog
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen) {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="confirm-header">
          <h2 id="confirm-title" className="confirm-title">{title}</h2>
          <button
            type="button"
            className="btn-invisible modal-close-button"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <XIcon />
          </button>
        </header>
        <div className="confirm-body">
          <p id="confirm-desc" className="confirm-message">{message}</p>
        </div>
        <footer className="confirm-footer">
          <button
            ref={cancelButtonRef}
            type="button"
            className="btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
          >
            Delete
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ConfirmDialog;
