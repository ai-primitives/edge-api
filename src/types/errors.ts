export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message)
    this.name = 'APIError'
  }
}
