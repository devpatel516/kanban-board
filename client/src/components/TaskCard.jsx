// What this file does: displays a single task card with its details and action buttons.
// When to edit: customize card layout, add more metadata (e.g. dates), or adjust actions.

import { useState } from "react";
import PriorityBadge from "./PriorityBadge.jsx";
import { COLUMNS } from "../constants.js";
import "../styles/TaskCard.css";

function TaskCard({ task, onEdit, onDelete, onMoveToColumn, onMoveUp, onMoveDown, isFirst, isLast }) {
  // Local state to toggle the dropdown move menu
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  // Other columns available to move this card into
  const otherColumns = COLUMNS.filter((col) => col.id !== task.columnId);

  return (
    <article className="task-card" aria-label={`Task: ${task.title}`}>
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="task-card-tags" aria-label="Tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag">#{tag}</span>
          ))}
        </div>
      )}

      <footer className="task-card-footer">
        {/* Move dropdown for keyboard and button-fallback reordering */}
        <div className="move-menu">
          <button
            type="button"
            className="icon-button"
            title="Move task"
            aria-label="Move task menu"
            onClick={() => setShowMoveMenu(!showMoveMenu)}
          >
            ⇅ Move
          </button>

          {showMoveMenu && (
            <div className="move-menu-dropdown" role="menu">
              <button
                type="button"
                className="move-menu-item"
                disabled={isFirst}
                onClick={() => { setShowMoveMenu(false); onMoveUp(task); }}
              >
                ▲ Move Up
              </button>
              <button
                type="button"
                className="move-menu-item"
                disabled={isLast}
                onClick={() => { setShowMoveMenu(false); onMoveDown(task); }}
              >
                ▼ Move Down
              </button>
              <div className="move-menu-divider" />
              {otherColumns.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className="move-menu-item"
                  onClick={() => { setShowMoveMenu(false); onMoveToColumn(task, col.id); }}
                >
                  → {col.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="task-card-actions">
          <button
            type="button"
            className="icon-button"
            title="Edit task"
            aria-label="Edit task"
            onClick={() => onEdit(task)}
          >
            ✏️
          </button>
          <button
            type="button"
            className="icon-button icon-button-danger"
            title="Delete task"
            aria-label="Delete task"
            onClick={() => onDelete(task)}
          >
            🗑️
          </button>
        </div>
      </footer>
    </article>
  );
}

export default TaskCard;

