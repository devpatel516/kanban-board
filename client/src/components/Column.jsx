// What this file does: renders a single Kanban column, its header, and list of task cards.
// When to edit: customize column actions, change empty state message, or add column-level filters.

import TaskCard from "./TaskCard.jsx";
import "../styles/Column.css";

function Column({
  column,
  tasks = [],
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  allTasks = [],
  renderTask,
  taskListRef,
  isDropTarget,
}) {
  // Move task up by one slot within this column
  // Worked example: tasks = [A(1000), B(2000), C(3000)]. Moving C(index 2) up:
  // targetIndex = 1 -> prev=A(1000), next=B(2000) -> new orderIndex = 1500.
  function handleMoveUp(task, index) {
    if (index === 0) return;
    const targetIndex = index - 1;
    const prevTask = targetIndex > 0 ? tasks[targetIndex - 1] : null;
    const nextTask = tasks[targetIndex];

    onMoveTask(task._id, {
      columnId: column.id,
      prevId: prevTask ? prevTask._id : null,
      nextId: nextTask ? nextTask._id : null,
      version: task.version,
    });
  }

  // Move task down by one slot within this column
  // Worked example: tasks = [A(1000), B(2000), C(3000)]. Moving A(index 0) down:
  // targetIndex = 1 -> prev=B(2000), next=C(3000) -> new orderIndex = 2500.
  function handleMoveDown(task, index) {
    if (index >= tasks.length - 1) return;
    const targetIndex = index + 1;
    const prevTask = tasks[targetIndex];
    const nextTask = targetIndex < tasks.length - 1 ? tasks[targetIndex + 1] : null;

    onMoveTask(task._id, {
      columnId: column.id,
      prevId: prevTask ? prevTask._id : null,
      nextId: nextTask ? nextTask._id : null,
      version: task.version,
    });
  }

  // Move task to the end of a different column
  function handleMoveToColumn(task, targetColumnId) {
    const targetColTasks = allTasks.filter((t) => t.columnId === targetColumnId);
    const lastTaskInTarget = targetColTasks.length > 0
      ? targetColTasks[targetColTasks.length - 1]
      : null;

    onMoveTask(task._id, {
      columnId: targetColumnId,
      prevId: lastTaskInTarget ? lastTaskInTarget._id : null,
      nextId: null,
      version: task.version,
    });
  }

  return (
    <section className="board-column" aria-label={`${column.label} column`}>
      <header className="column-header">
        <div className="column-header-title-group">
          <span className={`column-indicator indicator--${column.id}`} />
          <h2 className="column-title">{column.label}</h2>
          <span className="column-count" aria-label={`${tasks.length} tasks`}>
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onAddTask(column.id)}
          aria-label={`Add task to ${column.label}`}
        >
          + Add
        </button>
      </header>

      <div
        ref={taskListRef}
        className={`column-tasks-list${isDropTarget ? " column-tasks-list--drop-target" : ""}`}
      >
        {tasks.length === 0 ? (
          <div className="column-empty-state">No tasks yet</div>
        ) : (
          /* Keep the same Move menu actions available whether cards are sortable or not. */
          tasks.map((task, index) => {
            // Moves this card to another column using the existing fallback menu.
            function moveToColumn(targetColumnId) {
              handleMoveToColumn(task, targetColumnId);
            }

            // Moves this card up one position using the existing fallback menu.
            function moveUp() {
              handleMoveUp(task, index);
            }

            // Moves this card down one position using the existing fallback menu.
            function moveDown() {
              handleMoveDown(task, index);
            }

            const taskActions = {
              onMoveToColumn: moveToColumn,
              onMoveUp: moveUp,
              onMoveDown: moveDown,
              isFirst: index === 0,
              isLast: index === tasks.length - 1,
            };

            if (renderTask) return renderTask(task, taskActions);
            return (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                {...taskActions}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

export default Column;
