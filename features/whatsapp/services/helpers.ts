import type { z } from 'zod'

import {
  AuthenticationError,
  ERROR_MESSAGES,
  PermissionError,
  RateLimitError,
  WhatsAppAPIError
} from '@/schemas/CustomErros'
import { logger } from '@/lib/logger'

const VERSION = 'v21.0'
const PHONE_ID = process.env.PHONE_NUMBER_ID

const BASE_URL = 'https://graph.facebook.com'
const API_URL = `${BASE_URL}/${VERSION}/${PHONE_ID}`

// Updated fetch function with improved error handling
export async function fetchFromAPI<Schema extends z.ZodTypeAny>({
  path,
  params = {},
  method = 'GET',
  body,
  schema,
  retryCount = 0,
  maxRetries = 3
}: {
  path: string
  method?: 'GET' | 'POST' | 'PUT'
  body?: Record<string, unknown>
  params?: Record<string, string>
  schema: Schema
  retryCount?: number
  maxRetries?: number
}): Promise<z.infer<Schema>> {
  const url = new URL(`${API_URL}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  try {
    const response = await fetch(url.toString(), {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`
      }
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      handleAPIError(data.error, response.status)
    }

    try {
      return schema.parse(data)
    } catch (parseError) {
      throw new WhatsAppAPIError(
        'Error al procesar la respuesta de la API',
        0,
        0,
        'ParseError',
        response.status
      )
    }
  } catch (error) {
    // Retry logic for rate limit errors
    if (error instanceof RateLimitError && retryCount < maxRetries) {
      const delayMs = Math.min(1000 * retryCount ** 2, 8000)
      await new Promise((resolve) => setTimeout(resolve, delayMs))

      return fetchFromAPI({
        path,
        params,
        method,
        body,
        schema,
        retryCount: retryCount + 1,
        maxRetries
      })
    }

    // Re-throw custom errors
    if (error instanceof WhatsAppAPIError) {
      throw error
    }

    // Handle unexpected errors
    throw new WhatsAppAPIError(
      `Error inesperado: ${error instanceof Error ? error.message : String(error)}`,
      0,
      0,
      'UnexpectedError'
    )
  }
}

// Error handler function
function handleAPIError(error: any, status: number): never {
  const { message, type, code, error_subcode } = error || {}

  // Log error details for debugging
  logger.error('API Error Details:', undefined, {
    status,
    code,
    subcode: error_subcode,
    type,
    message,
    timestamp: new Date().toISOString()
  })

  switch (code) {
    case 4:
    case 17:
      throw new RateLimitError(ERROR_MESSAGES.RATE_LIMIT, code, error_subcode)

    case 190: {
      if ([463, 460].includes(error_subcode)) {
        throw new AuthenticationError(
          ERROR_MESSAGES.TOKEN_EXPIRED,
          code,
          error_subcode
        )
      }
      if ([458, 459].includes(error_subcode)) {
        throw new AuthenticationError(
          ERROR_MESSAGES.TOKEN_REVOKED,
          code,
          error_subcode
        )
      }
      throw new AuthenticationError(
        'Error de autenticación. Verifica el token.',
        code,
        error_subcode
      )
    }

    case 10:
    case 200:
      throw new PermissionError(
        ERROR_MESSAGES.PERMISSION_DENIED,
        code,
        error_subcode
      )

    case 100:
      throw new WhatsAppAPIError(
        ERROR_MESSAGES.INVALID_REQUEST,
        code,
        error_subcode,
        'InvalidRequest',
        status
      )

    default:
      throw new WhatsAppAPIError(
        `${ERROR_MESSAGES.UNKNOWN_ERROR}: ${message || 'Sin detalles'}`,
        code || 0,
        error_subcode,
        type || 'Unknown',
        status
      )
  }
}
