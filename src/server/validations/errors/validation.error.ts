/* eslint-disable @typescript-eslint/no-explicit-any */
export class ValidationError extends Error {
  public errors: any;

  constructor(message: string, errors: any) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}