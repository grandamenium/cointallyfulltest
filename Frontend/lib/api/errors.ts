export class APIError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static fromResponse(response: Response, data: unknown): APIError {
    const dataObj = data as Record<string, unknown> | null | undefined;
    const message = String(dataObj?.message || dataObj?.error || response.statusText);
    return new APIError(message, response.status, data);
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 400, { fields });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}
