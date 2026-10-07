export class AppError extends Error {
  constructor (
    public readonly status: number = 400,
    public readonly errorMessage: string
  ) {
    super(errorMessage)
  }

  toResponse () {
    return Response.json({
      error: this.errorMessage
    }, {
      status: this.status
    })
  }
}
