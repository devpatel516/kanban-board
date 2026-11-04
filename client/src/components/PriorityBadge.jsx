// What this file does: renders a colored badge showing task priority (Low, Medium, High).
// When to edit: change badge HTML structure or add an icon next to the priority text.

import { PRIORITY_STYLES } from "../constants.js";
import "../styles/PriorityBadge.css";

function PriorityBadge({ priority = "Medium" }) {
  // Look up CSS class name for this priority level (defaults to Medium if unknown)
  const badgeClass = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;

  return (
    <span className={`priority-badge ${badgeClass}`}>
      {priority}
    </span>
  );
}

export default PriorityBadge;

