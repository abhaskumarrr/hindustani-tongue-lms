import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Temporarily disabled middleware for debugging
 */
export async function middleware(request: NextRequest) {
  // Allow all requests to pass through for debugging
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}