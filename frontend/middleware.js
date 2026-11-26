import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasAuthToken = Boolean(accessToken || refreshToken);

  // 1. Protected Citizen Routes (/user/*)
  if (pathname.startsWith('/user')) {
    if (!hasAuthToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protected Staff & Investigator Routes (/admin/* except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!hasAuthToken) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  // 3. Protected Super Admin Routes (/super-admin/* except /super-admin/login)
  if (pathname.startsWith('/super-admin') && !pathname.startsWith('/super-admin/login')) {
    if (!hasAuthToken) {
      const superAdminLoginUrl = new URL('/super-admin/login', request.url);
      superAdminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(superAdminLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
  ],
};
