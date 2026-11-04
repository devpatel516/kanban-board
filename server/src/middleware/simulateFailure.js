// What this file does: simulates a server crash on any mutating request when the
//   caller sets the header "x-simulate-failure: true".
// When to edit: change the header name, or add other failure modes for testing.
//
// WHY THIS EXISTS: During development you want to test "what does the UI show
// when the server explodes?" without actually breaking anything. Add this header
// in your curl / Postman request and the error handler will fire immediately.

export function simulateFailure(req, res, next) {
  // Check for the special testing header (lowercase – HTTP headers are case-insensitive
  // but Express normalises them to lowercase for us).
  const shouldFail = req.headers["x-simulate-failure"] === "true";

  if (shouldFail) {
    // Build an error object the central errorHandler understands.
    const error = new Error("Simulated server failure (x-simulate-failure header was set)");
    error.statusCode = 500;
    error.code = "SIMULATED_FAILURE";

    // Pass the error to the next error-handling middleware (errorHandler.js).
    return next(error);
  }

  // No header present – continue normally to the actual controller.
  next();
}

