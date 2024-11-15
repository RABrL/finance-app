import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse
} from 'next/server'
import { clerkMiddleware } from '@clerk/nextjs/server'
import { createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

// Middleware personalizado
export default function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  // Si la ruta es /api/wa, permite el paso sin autenticación
  if (['/api/wa', '/financeapp-cover.png'].includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Para otras rutas, aplica el middleware de Clerk
  return clerkMiddleware((auth, req) => {
    if (!isPublicRoute(req)) {
      auth().protect()
    }
    return NextResponse.next()
  })(request, event)
}

export const config = {
  matcher: ['/((?!.+.[w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
