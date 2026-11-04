// What this file does: accessible modal dialog for creating or editing a task.
// When to edit: add new input fields (e.g. due date) or adjust form validation.

import { useState, useEffect, useRef } from "react";
import { PRIORITIES } from "../constants.js";
import "../styles/TaskModal.css";

function TaskModal({ isOpen, onClose, onSave, taskToEdit = null, defaultColumnId = "todo" }) {
  // Controlled form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference to the title input field so we can focus it automatically when opening
  const titleInputRef = useRef(null);

  // Pre-fill form when editing an existing task, or reset when creating a new one
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || "Medium");
      setTagsInput(taskToEdit.tags ? taskToEdit.tags.join(", ") : "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setTagsInput("");
    }
  }, [taskToEdit, isOpen]);

  // Accessibility: Move focus to the first input field as soon as modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  // Accessibility: Close modal when the user presses the Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;

    // Split comma-separated tags and remove leading/trailing whitespace
    const cleanTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      tags: cleanTags,
      columnId: taskToEdit ? taskToEdit.columnId : defaultColumnId,
    };

    setIsSubmitting(true);
    try {
      await onSave(taskPayload);
      onClose();
    } catch {
      // Error is handled with a toast in useBoard hook; keep modal open on failure
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="modal-heading" className="modal-title">
            {taskToEdit ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix navbar alignment"
              maxLength={120}
              required
            />
            <span className="form-help-text">Max 120 characters</span>
          </div>

          <div className="form-group">
            <label htmlFor="task-description" className="form-label">
              Description
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or details..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-priority" className="form-label">
              Priority
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-tags" className="form-label">
              Tags
            </label>
            <input
              id="task-tags"
              type="text"
              className="form-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="frontend, bug, ui (comma separated)"
            />
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? "Saving..." : taskToEdit ? "Save Changes" : "Create Task"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;

