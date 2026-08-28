export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (message = "Resource not found") => new AppError("NOT_FOUND", message, 404);
export const unauthorized = () => new AppError("UNAUTHORIZED", "Authentication required", 401);
export const forbidden = () => new AppError("FORBIDDEN", "You do not have access to this resource", 403);
