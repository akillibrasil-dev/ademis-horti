'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const credentials = z.object({
 email: z.string().trim().email().max(254),
 password: z.string().min(8).max(100),
});
export async function signIn(form: FormData) {
 const parsed = credentials.safeParse({ email: form.get('email'), password: form.get('password') });
 if (!parsed.success) redirect('/entrar?erro=dados');
 const supabase = await createClient();
 const { error } = await supabase.auth.signInWithPassword(parsed.data);
 if (error) redirect('/entrar?erro=credenciais');
 redirect('/app');
}

export async function signUp(form: FormData) {
 const parsed = credentials.extend({ display_name: z.string().trim().min(2).max(80) })
  .safeParse({
   email: form.get('email'), password: form.get('password'),
   display_name: form.get('display_name'),
  });
 if (!parsed.success) redirect('/registrar?erro=dados');
 const supabase = await createClient();
 const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
 const { error } = await supabase.auth.signUp({
  email: parsed.data.email,
  password: parsed.data.password,
  options: {
   data: { display_name: parsed.data.display_name },
   emailRedirectTo: new URL('/auth/callback', siteUrl).toString(),
  },
 });
 if (error) redirect('/registrar?erro=cadastro');
 redirect('/entrar?aviso=confirmar');
}

export async function signOut() {
 const supabase = await createClient();
 await supabase.auth.signOut();
 redirect('/');
}
