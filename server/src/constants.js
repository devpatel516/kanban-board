// What this file does: stores every magic value used across the server in one place.
// When to edit: add a new column, change priority options, or tune ordering gap size.

// The three columns – used for validation and seeding.
// The order here is the visual left-to-right order on the board.
export const COLUMNS = ["todo", "in-progress", "done"];

// Valid priority levels (must match the Task model enum).
export const PRIORITIES = ["Low", "Medium", "High"];

// When a card is appended to the end of a column, its orderIndex is
// (highest existing orderIndex) + this gap. Keeping it large means you can
// insert many cards between two existing ones before needing to renumber.
// Example: last card has orderIndex 3000 -> new card gets 4000.
export const ORDER_GAP = 1000;

