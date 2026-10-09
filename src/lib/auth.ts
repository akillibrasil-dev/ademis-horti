import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type OrgRole = 'ORG_ADMIN' | 'OPERATOR' | 'DELIVERY';
export type OrgContext = {
 organization: { id: string; name: string; slug: string; status: string };
 role: OrgRole;
};

export async function requireUser() {
 const supabase = await createClient();
 const { data: { user }, error } = await supabase.auth.getUser();
 if (error || !user) redirect('/entrar');
 return { supabase, user };
}

export async function requireOrg(slug: string): Promise<OrgContext> {
 const { supabase, user } = await requireUser();
 const { data: org } = await supabase.from('organizations')
  .select('id,name,slug,status').eq('slug', slug).maybeSingle();
 if (!org) notFound();
 const { data: member } = await supabase.from('organization_members')
  .select('role').eq('organization_id', org.id).eq('user_id', user.id)
  .eq('status','active').maybeSingle();
 if (!member) notFound();
 return { organization: org, role: member.role as OrgRole };
}

export async function requireOrgAdmin(slug: string) {
 const ctx = await requireOrg(slug);
 if (ctx.role !== 'ORG_ADMIN') notFound();
 return ctx;
}

export async function requireFeature(orgId: string, feature: string) {
 const { supabase } = await requireUser();
 const { data, error } = await supabase.rpc('org_has_feature', { p_org: orgId, p_feature: feature });
 if (error || !data) notFound();
}

export async function requirePlatformAdmin() {
 const { supabase } = await requireUser();
 const { data, error } = await supabase.rpc('is_platform_admin');
 if (error || data !== true) notFound();
 return { supabase };
}
