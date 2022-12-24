export class Success<T> {
  type: 'success'
  value?: T

  public constructor(
    value?: T
  ) {
    this.type = 'success'
    this.value = value
  }
}

export class Failure {
  type: 'failure'
  error?: string

  public constructor(
    error?: any
  ) {
    this.type = 'failure'
    this.error = error
  }
}

export type Result<T> = Success<T> | Failure
