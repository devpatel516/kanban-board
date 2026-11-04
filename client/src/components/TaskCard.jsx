// What this file does: displays a single task card with its details and action buttons.
// When to edit: customize card layout, add more metadata (e.g. dates), or adjust actions.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PriorityBadge from "./PriorityBadge.jsx";
import { COLUMNS } from "../constants.js";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  KebabIcon,
  PencilIcon,
  TrashIcon,
} from "./Icons.jsx";
import "../styles/TaskCard.css";

// Shows task actions and keeps the move menu visible outside the scrollable column.
function TaskCard({
  task,
  onEdit,
  onDelete,
  onMoveToColumn,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragAttributes,
  dragListeners,
}) {
  // Local state controls the card action menu without changing task behavior.
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const moveButtonRef = useRef(null);
  const moveMenuRef = useRef(null);

  // Other columns available to move this card into
  const otherColumns = COLUMNS.filter((col) => col.id !== task.columnId);

  // Positions the menu in the page layer so scrollable columns cannot cut it off.
  function handleMoveMenuToggle() {
    if (showMoveMenu) {
      setShowMoveMenu(false);
      return;
    }

    const buttonBounds = moveButtonRef.current.getBoundingClientRect();
    const menuHeight = 240;
    let top = buttonBounds.top - menuHeight - 8;
    if (top < 8) top = buttonBounds.bottom + 8;
    if (top + menuHeight > window.innerHeight - 8) {
      top = window.innerHeight - menuHeight - 8;
    }
    const left = Math.min(buttonBounds.left, window.innerWidth - 192 - 8);
    setMenuPosition({ top, left: Math.max(8, left) });
    setShowMoveMenu(true);
  }

  // Closes the menu when the user clicks elsewhere, presses Escape, or scrolls.
  useEffect(() => {
    if (!showMoveMenu) return undefined;

    function handleOutsideClick(event) {
      const clickedButton = moveButtonRef.current?.contains(event.target);
      const clickedMenu = moveMenuRef.current?.contains(event.target);
      if (!clickedButton && !clickedMenu) setShowMoveMenu(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") setShowMoveMenu(false);
    }

    function handlePageScroll() {
      setShowMoveMenu(false);
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handlePageScroll, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handlePageScroll, true);
    };
  }, [showMoveMenu]);

  return (
    <article className="task-card" aria-label={`Task: ${task.title}`}>
      <div className="task-card-header">
        <div className="task-card-title-group">
          <button
            type="button"
            className="btn-invisible task-card-drag-handle"
            aria-label={`Drag task: ${task.title}`}
            {...dragAttributes}
            {...dragListeners}
          >
            ⠿
          </button>
          <h3 className="task-card-title">{task.title}</h3>
        </div>
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
            ref={moveButtonRef}
            type="button"
            className="btn-invisible card-menu-button"
            title="Card actions"
            aria-label="Card actions"
            aria-expanded={showMoveMenu}
            onClick={handleMoveMenuToggle}
          >
            <KebabIcon />
          </button>

          {showMoveMenu && menuPosition && createPortal(
            <div
              ref={moveMenuRef}
              className="move-menu-dropdown"
              role="menu"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
              <button
                type="button"
                className="move-menu-item"
                disabled={isFirst}
                onClick={() => { setShowMoveMenu(false); onMoveUp(task); }}
              >
                <ChevronUpIcon />
                <span>Move up</span>
              </button>
              <button
                type="button"
                className="move-menu-item"
                disabled={isLast}
                onClick={() => { setShowMoveMenu(false); onMoveDown(task); }}
              >
                <ChevronDownIcon />
                <span>Move down</span>
              </button>
              <div className="move-menu-divider" />
              {otherColumns.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className="move-menu-item"
                  onClick={() => { setShowMoveMenu(false); onMoveToColumn(task, col.id); }}
                >
                  <ArrowRightIcon />
                  <span>Move to {col.label}</span>
                </button>
              ))}
              <div className="move-menu-divider" />
              <button
                type="button"
                className="move-menu-item"
                onClick={() => { setShowMoveMenu(false); onEdit(task); }}
              >
                <PencilIcon />
                <span>Edit</span>
              </button>
              <button
                type="button"
                className="move-menu-item move-menu-item-danger"
                onClick={() => { setShowMoveMenu(false); onDelete(task); }}
              >
                <TrashIcon />
                <span>Delete</span>
              </button>
            </div>,
            document.body,
          )}
        </div>

      </footer>
    </article>
  );
}

export default TaskCard;
