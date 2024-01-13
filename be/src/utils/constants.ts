export const STATUS = {
  SUCCESS: {
    CODE: 200,
    MSG: 'Success'
  },
  CREATED: {
    CODE: 201,
    MSG: 'Created'
  },
  NO_CONTENT: {
    CODE: 204
  },
  BAD_REQUEST: {
    CODE: 400,
    MSG: 'Bad request'
  },
  UNAUTHORIZED: {
    CODE: 401,
    MSG: 'Unauthorized'
  },
  FORBIDDEN: {
    CODE: 403,
    MSG: 'Forbidden'
  },
  NOT_FOUND: {
    CODE: 404,
    MSG: 'Not found'
  },
  NOT_ALLOWED: {
    CODE: 405,
    MSG: 'Method not allowed'
  },
  CONFLICT: {
    CODE: 409,
    MSG: 'Conflict'
  },
  PAYLOAD_TOO_LARGE: {
    CODE: 413,
    MSG: 'Request entity is too large'
  },
  SERVER_ERROR: {
    CODE: 500,
    MSG: 'Server error, please try again'
  },
  BAD_GATEWAY: {
    CODE: 502,
    MSG: 'Server error, please try again'
  },
  SERVICE_UNAVAILABLE: {
    CODE: 503,
    MSG: 'Server error, please try again'
  },
  GATEWAY_TIMEOUT: {
    CODE: 504,
    MSG: 'Server error, please try again'
  }
} as const;

export const VALIDATION = {} as const;
