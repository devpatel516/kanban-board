// What this file does: renders a colored badge showing task priority (Low, Medium, High).
// When to edit: change badge HTML structure or add another priority label.

import { PRIORITY_STYLES } from "../constants.js";
import "../styles/PriorityBadge.css";

function PriorityBadge({ priority = "Medium" }) {
  // Look up the matching style while keeping unknown values safe to display.
  const badgeClass = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;

  return (
    <span className={`priority-badge ${badgeClass}`}>
      <span className="priority-badge-dot" aria-hidden="true" />
      {priority}
    </span>
  );
}

export default PriorityBadge;
