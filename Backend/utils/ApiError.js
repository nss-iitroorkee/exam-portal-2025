class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message); //This calls the constructor of the Error class, which initializes the message property.
    this.statusCode = statusCode;
    this.message = message;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constuctor);
    }
  }
}

/* A stack is a data structure that keeps track of function calls.
 * When an error occurs, the stack trace helps identify where the error happened
 * by listing the sequence of function calls that led to the error. */

export { ApiError };
