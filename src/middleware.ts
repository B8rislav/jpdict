import { jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  try {
    await jwtVerify(refreshToken, secret, { algorithms: ['HS256'] });
  } catch {
    return NextResponse.json({ detail: 'Invalid or expired token' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/dictionary/:path*', '/api/history/:path*'],
};
