import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
 return updateSession(request);
}
// Public landing/login do not require environment credentials to render.
// Protected areas refresh sessions and verify authentication server-side.
export const config = {
 matcher: ['/app/:path*', '/admin/:path*'],
};
