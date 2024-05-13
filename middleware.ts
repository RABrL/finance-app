import { NextResponse } from 'next/server'

import { clerkMiddleware } from '@clerk/nextjs/server'
import { createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/'])

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+.[w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
