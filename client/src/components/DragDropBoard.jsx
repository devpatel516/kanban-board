// What this file does: makes the board columns and task cards sortable with dnd-kit.
// When to edit: change drag behavior, drop positions, or keyboard and pointer sensors.

import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { COLUMN_DROP_ID_PREFIX, DRAG_ACTIVATION_DISTANCE } from "../constants.js";
import Column from "./Column.jsx";
import PriorityBadge from "./PriorityBadge.jsx";
import TaskCard from "./TaskCard.jsx";

// Finds which column a task or empty-column drop target belongs to.
function getDropColumnId(tasks, targetId) {
  if (String(targetId).startsWith(COLUMN_DROP_ID_PREFIX)) {
    return String(targetId).slice(COLUMN_DROP_ID_PREFIX.length);
  }

  const targetTask = tasks.find((task) => task._id === targetId);
  return targetTask ? targetTask.columnId : null;
}

// Previews the dragged card in its new column and position before the server saves it.
function createDragPreview(tasks, activeId, overId, activeRect, overRect) {
  if (activeId === overId) return tasks;

  const movingTask = tasks.find((task) => task._id === activeId);
  const destinationColumnId = getDropColumnId(tasks, overId);
  if (!movingTask || !destinationColumnId) return tasks;

  const remainingTasks = tasks.filter((task) => task._id !== activeId);
  const destinationTasks = remainingTasks.filter(
    (task) => task.columnId === destinationColumnId,
  );
  const targetIndex = destinationTasks.findIndex((task) => task._id === overId);
  let insertionIndex = destinationTasks.length;

  if (targetIndex !== -1) {
    // The card's center decides whether it should land before or after the card under it.
    const activeCenter = activeRect ? activeRect.top + activeRect.height / 2 : 0;
    const overCenter = overRect ? overRect.top + overRect.height / 2 : 0;
    const shouldInsertAfter = activeRect && overRect && activeCenter > overCenter;
    insertionIndex = targetIndex + (shouldInsertAfter ? 1 : 0);
  }

  const movedTask = { ...movingTask, columnId: destinationColumnId };
  const nextTask = destinationTasks[insertionIndex];
  const nextTasks = [...remainingTasks];

  if (nextTask) {
    const nextTaskIndex = nextTasks.findIndex((task) => task._id === nextTask._id);
    nextTasks.splice(nextTaskIndex, 0, movedTask);
  } else {
    const lastTask = destinationTasks[destinationTasks.length - 1];
    const lastTaskIndex = lastTask
      ? nextTasks.findIndex((task) => task._id === lastTask._id)
      : -1;
    nextTasks.splice(lastTaskIndex + 1, 0, movedTask);
  }

  return nextTasks;
}

// Finds the destination neighbors that the API needs for fractional ordering.
function getDropNeighbors(tasks, activeId) {
  const taskIndex = tasks.findIndex((task) => task._id === activeId);
  if (taskIndex === -1) return null;

  const movedTask = tasks[taskIndex];
  const columnTasks = tasks.filter((task) => task.columnId === movedTask.columnId);
  const columnIndex = columnTasks.findIndex((task) => task._id === activeId);

  // Example: neighbors with orderIndex 1000 and 2000 produce a new orderIndex of 1500.
  return {
    columnId: movedTask.columnId,
    prevId: columnIndex > 0 ? columnTasks[columnIndex - 1]._id : null,
    nextId: columnIndex < columnTasks.length - 1
      ? columnTasks[columnIndex + 1]._id
      : null,
  };
}

// Makes one task card sortable while keeping its buttons separate from the drag handle.
function SortableTaskCard({ task, taskActions, onEditTask, onDeleteTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { type: "task" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} className="sortable-task-card" style={style}>
      <TaskCard
        task={task}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        {...taskActions}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

// Makes the full task area a drop target, including when a column has no cards.
function DroppableColumn({ column, tasks, allTasks, ...columnProps }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${COLUMN_DROP_ID_PREFIX}${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  // Passes the column's fallback movement actions through to the draggable card.
  function renderTask(task, taskActions) {
    return (
      <SortableTaskCard
        key={task._id}
        task={task}
        taskActions={taskActions}
        onEditTask={columnProps.onEditTask}
        onDeleteTask={columnProps.onDeleteTask}
      />
    );
  }

  return (
    <Column
      {...columnProps}
      column={column}
      tasks={tasks}
      allTasks={allTasks}
      renderTask={renderTask}
      taskListRef={setNodeRef}
      isDropTarget={isOver}
    />
  );
}

// Provides pointer and keyboard drag controls and saves the final drop through useBoard.
function DragDropBoard({
  columns,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}) {
  const [previewTasks, setPreviewTasks] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const previewTasksRef = useRef([]);
  const sensors = useSensors(
    // A small distance avoids starting a drag when someone is trying to scroll on touch.
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const visibleTasks = previewTasks || tasks;
  const activeTask = visibleTasks.find((task) => task._id === activeTaskId);

  // Keeps the rendered preview and the latest event-handler copy in sync.
  function updatePreviewTasks(nextTasks) {
    previewTasksRef.current = nextTasks;
    setPreviewTasks(nextTasks);
  }

  // Step 1: remember which card was picked up.
  // Step 2: copy the current order so drag previews never mutate server-backed tasks.
  function handleDragStart(event) {
    setActiveTaskId(event.active.id);
    updatePreviewTasks(tasks);
  }

  // Step 1: ignore movement outside a valid drop target.
  // Step 2: put the dragged card before or after the hovered card (or at the column end).
  // Step 3: update the preview so both same-column and cross-column movement are visible.
  function handleDragOver(event) {
    if (!event.over) return;
    const nextTasks = createDragPreview(
      previewTasksRef.current,
      event.active.id,
      event.over.id,
      event.active.rect.current.translated,
      event.over.rect,
    );
    updatePreviewTasks(nextTasks);
  }

  // Step 1: rebuild the final preview from the actual drop target.
  // Step 2: find the destination neighbors and compare them with the original position.
  // Step 3: call useBoard only for a real move, then clear the temporary preview.
  function handleDragEnd(event) {
    if (event.over) {
      const finalTasks = createDragPreview(
        previewTasksRef.current,
        event.active.id,
        event.over.id,
        event.active.rect.current.translated,
        event.over.rect,
      );
      const dropNeighbors = getDropNeighbors(finalTasks, event.active.id);
      const movedTask = tasks.find((task) => task._id === event.active.id);

      if (dropNeighbors && movedTask) {
        const oldColumnTasks = tasks.filter((task) => task.columnId === movedTask.columnId);
        const oldIndex = oldColumnTasks.findIndex((task) => task._id === movedTask._id);
        const oldPrevId = oldIndex > 0 ? oldColumnTasks[oldIndex - 1]._id : null;
        const oldNextId = oldIndex < oldColumnTasks.length - 1
          ? oldColumnTasks[oldIndex + 1]._id
          : null;
        const positionChanged = dropNeighbors.columnId !== movedTask.columnId
          || dropNeighbors.prevId !== oldPrevId
          || dropNeighbors.nextId !== oldNextId;

        if (positionChanged) {
          onMoveTask(movedTask._id, { ...dropNeighbors, version: movedTask.version });
        }
      }
    }

    setActiveTaskId(null);
    updatePreviewTasks(null);
  }

  // Restores the real task list when the user lets go outside any drop target.
  function handleDragCancel() {
    setActiveTaskId(null);
    updatePreviewTasks(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="board-columns-grid">
        {/* Filter each column from the preview list so cards visibly change columns while dragging. */}
        {columns.map((column) => {
          const columnTasks = visibleTasks.filter((task) => task.columnId === column.id);
          return (
            <SortableContext
              key={column.id}
              items={columnTasks.map((task) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn
                column={column}
                tasks={columnTasks}
                allTasks={visibleTasks}
                onAddTask={onAddTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onMoveTask={onMoveTask}
              />
            </SortableContext>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <article className="task-card task-card-drag-overlay" aria-hidden="true">
            <div className="task-card-header">
              <h3 className="task-card-title">{activeTask.title}</h3>
              <PriorityBadge priority={activeTask.priority} />
            </div>
            {activeTask.description && (
              <p className="task-card-description">{activeTask.description}</p>
            )}
            {activeTask.tags && activeTask.tags.length > 0 && (
              <div className="task-card-tags" aria-label="Tags">
                {activeTask.tags.map((tag, index) => (
                  <span key={index} className="task-tag">#{tag}</span>
                ))}
              </div>
            )}
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default DragDropBoard;
