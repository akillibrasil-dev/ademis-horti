import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from './config';

export async function updateSession(request: NextRequest) {
 let response = NextResponse.next({ request });
 const { url, anonKey } = supabaseConfig();
 const supabase = createServerClient(url, anonKey, {
  cookies: {
   getAll() { return request.cookies.getAll(); },
   setAll(items) {
    items.forEach(({ name, value }) => request.cookies.set(name, value));
    response = NextResponse.next({ request });
    items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
   },
  },
 });
 // Never use getSession() to authorize on the server.
 const { data: { user } } = await supabase.auth.getUser();
 const pathname = request.nextUrl.pathname;
 if (!user && (pathname.startsWith('/app') || pathname.startsWith('/admin'))) {
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = '/entrar';
  redirectTo.search = '';
  return NextResponse.redirect(redirectTo);
 }
 return response;
}
