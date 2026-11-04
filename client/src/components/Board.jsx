// What this file does: renders the Kanban board, manages modal states, and handles errors/loading.
// When to edit: add board-level filters, search bar, or bulk actions.

import { useState } from "react";
import DragDropBoard from "./DragDropBoard.jsx";
import TaskModal from "./TaskModal.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { useBoard } from "../hooks/useBoard.js";
import { COLUMNS } from "../constants.js";
import "../styles/Board.css";

function Board() {
  const {
    tasks,
    isLoading,
    error,
    reload,
    addTask,
    editTask,
    removeTask,
    moveTask,
  } = useBoard();

  // Modal dialog visibility and selected task states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultColumnId, setDefaultColumnId] = useState("todo");

  // Delete confirmation dialog state
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Open modal for creating a new task in a specific column
  function handleOpenCreateModal(columnId) {
    setTaskToEdit(null);
    setDefaultColumnId(columnId);
    setIsModalOpen(true);
  }

  // Open modal for editing an existing task
  function handleOpenEditModal(task) {
    setTaskToEdit(task);
    setIsModalOpen(true);
  }

  // Save handler for both create and edit
  async function handleSaveTask(taskPayload) {
    if (taskToEdit) {
      await editTask(taskToEdit._id, taskPayload);
    } else {
      await addTask(taskPayload);
    }
  }

  // Confirm delete handler
  async function handleConfirmDelete() {
    if (taskToDelete) {
      await removeTask(taskToDelete._id);
      setTaskToDelete(null);
    }
  }

  // ── 1. Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="board-container">
        <div className="board-status-screen">
          <div className="spinner" aria-hidden="true" />
          <p className="status-message">Loading your board...</p>
        </div>
      </main>
    );
  }

  // ── 2. Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="board-container">
        <div className="board-status-screen">
          <h2 className="status-title">Unable to connect to server</h2>
          <p className="status-message">{error}</p>
          <button type="button" className="btn btn-primary" onClick={reload}>
            Retry
          </button>
        </div>
      </main>
    );
  }

  // ── 3. Normal Board View ───────────────────────────────────────────────────
  return (
    <main className="board-container">
      <DragDropBoard
        columns={COLUMNS}
        tasks={tasks}
        onAddTask={handleOpenCreateModal}
        onEditTask={handleOpenEditModal}
        onDeleteTask={(task) => setTaskToDelete(task)}
        onMoveTask={moveTask}
      />

      {/* Create / Edit Modal Dialog */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultColumnId={defaultColumnId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.title}"? This cannot be undone.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </main>
  );
}

export default Board;
