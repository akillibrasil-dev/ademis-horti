import { requireOrg, requireUser } from '@/lib/auth';

export default async function OrgDashboard({ params }: {
 params: Promise<{ orgSlug: string }>
}) {
 const { orgSlug } = await params;
 const { organization, role } = await requireOrg(orgSlug);
 const { supabase } = await requireUser();
 const [{ data: subscription }, { data: settings }] = await Promise.all([
  supabase.from('subscriptions').select('plan_code,status').eq('organization_id',organization.id).single(),
  supabase.from('organization_settings').select('*').eq('organization_id',organization.id).single(),
 ]);
 const pro = await supabase.rpc('org_has_feature',{p_org:organization.id,p_feature:'plantings'});
 return <>
  <div><p className="eyebrow">Fase 1 · Fundação SaaS</p><h1>{organization.name}</h1>
   <p className="muted">Organização isolada · {role}</p></div>
  <div className="grid3">
   <div className="card"><p className="eyebrow">Plano</p><h2>{subscription?.plan_code ?? '—'}</h2><p className="muted">{subscription?.status ?? 'Não configurado'}</p></div>
   <div className="card"><p className="eyebrow">Produção Pro</p><h2>{pro.data ? 'Habilitado' : 'Restrito'}</h2><p className="muted">Verificação feita no banco de dados.</p></div>
   <div className="card"><p className="eyebrow">Pré-venda padrão</p><h2>{settings ? Math.round(Number(settings.preorder_ratio)*100)+'%' : '—'}</h2><p className="muted">Limite inicial configurável.</p></div>
  </div>
  <div className="card"><h2>A fundação está preparada</h2>
   <p className="muted">Autenticação, organizações, equipe, perfis e controle de planos estão disponíveis. Produtos, catálogo, estoque e pedidos serão implementados na Fase 2.</p>
  </div>
 </>;
}
