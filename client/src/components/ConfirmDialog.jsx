// What this file does: accessible confirmation dialog to prevent accidental task deletions.
// When to edit: customize warning copy or add another action confirmation.

import { useEffect, useRef } from "react";
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
        <h2 id="confirm-title" className="confirm-title">
          ⚠️ {title}
        </h2>
        <p id="confirm-desc" className="confirm-message">
          {message}
        </p>
        <footer className="confirm-footer">
          <button
            ref={cancelButtonRef}
            type="button"
            className="btn btn-secondary"
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

