import { NextResponse } from 'next/server'

import { clerkMiddleware } from '@clerk/nextjs/server'
import { createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in', '/sign-up']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+.[w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
