// What this file does: one central place that catches every error thrown in any
//   controller and sends back the standard error shape { error: { code, message } }.
// When to edit: add more error codes, change the shape, or log errors to a service.

// Express recognises a 4-argument middleware as an error handler automatically.
// You MUST keep all four arguments (err, req, res, next) even if next is unused;
// removing any one of them stops Express from treating it as an error handler.
export function errorHandler(err, req, res, next) {
  // Print the full error to the server console so it shows up in your terminal.
  // This is the first place to look when something breaks.
  console.error("[Error]", err.message);

  // If the error already carries a status code (we set this manually in controllers),
  // use that; otherwise default to 500 (Internal Server Error).
  const statusCode = err.statusCode || 500;

  // Every error response uses this exact shape so the client can handle them uniformly.
  res.status(statusCode).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Something went wrong. Please try again.",
    },
  });
}

