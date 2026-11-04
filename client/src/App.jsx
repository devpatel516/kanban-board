// What this file does: the root React component – renders the app shell.
// When to edit: change the top-level layout, add a nav bar, or swap in a router.

import { Toaster } from "react-hot-toast";

// App is intentionally tiny right now.
// In Task 3 we will import the Board component and render it here.
function App() {
  return (
    <div>
      {/* Toaster renders toast notifications (success/error popups) anywhere in the app.
          It lives here so it is always mounted, regardless of which page is showing. */}
      <Toaster position="top-right" />

      <h1>🐾 PetPooja Kanban Board</h1>
      <p>Server is running. Board UI coming in Task 3.</p>
    </div>
  );
}

export default App;
