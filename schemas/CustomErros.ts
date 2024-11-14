// Custom error classes
export class WhatsAppAPIError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly subcode?: number,
    public readonly type?: string,
    public readonly httpStatus?: number
  ) {
    super(message)
    this.name = 'WhatsAppAPIError'
    Object.setPrototypeOf(this, WhatsAppAPIError.prototype)
  }
}

export class RateLimitError extends WhatsAppAPIError {
  constructor(message: string, code: number, subcode?: number) {
    super(message, code, subcode, 'RateLimit')
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

export class AuthenticationError extends WhatsAppAPIError {
  constructor(message: string, code: number, subcode?: number) {
    super(message, code, subcode, 'Authentication')
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

export class PermissionError extends WhatsAppAPIError {
  constructor(message: string, code: number, subcode?: number) {
    super(message, code, subcode, 'Permission')
    this.name = 'PermissionError'
    Object.setPrototypeOf(this, PermissionError.prototype)
  }
}

// Error messages constants
export const ERROR_MESSAGES = {
  RATE_LIMIT: 'Se ha alcanzado el límite de solicitudes. Intenta más tarde.',
  PERMISSION_DENIED:
    'No tienes permisos suficientes para realizar esta operación.',
  TOKEN_EXPIRED: 'El token de acceso ha expirado. Por favor, renuévalo.',
  TOKEN_REVOKED: 'El token de acceso fue revocado. Solicita nuevo acceso.',
  INVALID_REQUEST: 'La solicitud es inválida. Verifica los parámetros.',
  UNKNOWN_ERROR: 'Error desconocido en la API de WhatsApp.'
} as const
