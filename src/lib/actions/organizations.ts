'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireOrgAdmin, requireUser } from '@/lib/auth';

const newOrganization = z.object({
 name: z.string().trim().min(3).max(120),
 slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).min(3).max(50),
});
export async function createOrganization(form: FormData) {
 const parsed = newOrganization.safeParse({
  name: form.get('name'), slug: form.get('slug'),
 });
 if (!parsed.success) redirect('/app/nova?erro=validacao');
 const { supabase } = await requireUser();
 const { error } = await supabase.rpc('create_organization', {
  p_name: parsed.data.name, p_slug: parsed.data.slug,
 });
 if (error) redirect('/app/nova?erro=criacao');
 revalidatePath('/app');
 redirect('/app/' + parsed.data.slug);
}

export async function addMember(form: FormData) {
 const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,50}$/),
  email: z.string().email().max(254),
  role: z.enum(['ORG_ADMIN','OPERATOR','DELIVERY']),
 });
 const parsed = schema.safeParse({
  slug: form.get('slug'), email: form.get('email'), role: form.get('role'),
 });
 if (!parsed.success) redirect('/app?erro=validacao');
 const ctx = await requireOrgAdmin(parsed.data.slug);
 const { supabase } = await requireUser();
 const { error } = await supabase.rpc('add_existing_member', {
  p_org: ctx.organization.id, p_email: parsed.data.email, p_role: parsed.data.role,
 });
 if (error) redirect('/app/' + ctx.organization.slug + '/equipe?erro=adicionar');
 revalidatePath('/app/' + ctx.organization.slug + '/equipe');
 redirect('/app/' + ctx.organization.slug + '/equipe?aviso=adicionado');
}

export async function removeMember(form: FormData) {
 const parsed = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,50}$/),
  userId: z.string().uuid(),
 }).safeParse({ slug: form.get('slug'), userId: form.get('userId') });
 if (!parsed.success) redirect('/app');
 const ctx = await requireOrgAdmin(parsed.data.slug);
 const { supabase } = await requireUser();
 const { error } = await supabase.rpc('remove_member', {
  p_org: ctx.organization.id, p_user: parsed.data.userId,
 });
 if (error) redirect('/app/' + ctx.organization.slug + '/equipe?erro=remover');
 revalidatePath('/app/' + ctx.organization.slug + '/equipe');
 redirect('/app/' + ctx.organization.slug + '/equipe?aviso=removido');
}

export async function updateSettings(form: FormData) {
 const parsed = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,50}$/),
  preorder_ratio: z.coerce.number().min(0).max(1),
  pix_manual_reservation_hours: z.coerce.number().int().min(1).max(72),
  gateway_reservation_hours: z.coerce.number().int().min(1).max(24),
  weighing_review_ratio: z.coerce.number().min(0).max(1),
 }).safeParse({
  slug: form.get('slug'), preorder_ratio: form.get('preorder_ratio'),
  pix_manual_reservation_hours: form.get('pix_manual_reservation_hours'),
  gateway_reservation_hours: form.get('gateway_reservation_hours'),
  weighing_review_ratio: form.get('weighing_review_ratio'),
 });
 if (!parsed.success) redirect('/app');
 const ctx = await requireOrgAdmin(parsed.data.slug);
 const { supabase } = await requireUser();
 const { error } = await supabase.from('organization_settings')
  .update({
   preorder_ratio: parsed.data.preorder_ratio,
   pix_manual_reservation_hours: parsed.data.pix_manual_reservation_hours,
   gateway_reservation_hours: parsed.data.gateway_reservation_hours,
   weighing_review_ratio: parsed.data.weighing_review_ratio,
  }).eq('organization_id', ctx.organization.id);
 if (error) redirect('/app/' + ctx.organization.slug + '/configuracoes?erro=salvar');
 revalidatePath('/app/' + ctx.organization.slug + '/configuracoes');
 redirect('/app/' + ctx.organization.slug + '/configuracoes?aviso=salvo');
}

export async function setPlan(form: FormData) {
 const parsed = z.object({
  organizationId: z.string().uuid(),
  plan: z.enum(['ESSENCIAL','PRO']),
 }).safeParse({ organizationId: form.get('organizationId'), plan: form.get('plan') });
 if (!parsed.success) redirect('/admin?erro=validacao');
 const { requirePlatformAdmin } = await import('@/lib/auth');
 const { supabase } = await requirePlatformAdmin();
 const { error } = await supabase.rpc('platform_set_plan', {
  p_org: parsed.data.organizationId, p_plan: parsed.data.plan,
 });
 if (error) redirect('/admin?erro=alterar');
 revalidatePath('/admin');
 redirect('/admin?aviso=plano');
}
