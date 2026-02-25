export class AppError extends Error {
  constructor(
    public message: string,
    public code: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toAppError(err: unknown) {
  if (err instanceof AppError) return err;
  if (err instanceof Error) return new AppError(err.message, 500);
  return new AppError("Unknown error", 500);
}
