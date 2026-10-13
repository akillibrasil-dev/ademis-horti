import { requireOrgAdmin, requireUser } from '@/lib/auth';
import { updateSettings } from '@/lib/actions/organizations';
export default async function Settings({ params, searchParams }: {
 params: Promise<{ orgSlug: string }>;
 searchParams: Promise<{ erro?: string; aviso?: string }>;
}) {
 const { orgSlug } = await params;
 const { organization } = await requireOrgAdmin(orgSlug);
 const { supabase } = await requireUser();
 const { data, error } = await supabase.from('organization_settings').select('*').eq('organization_id',organization.id).single();
 const notices = await searchParams;
 return <>
  <div><p className="eyebrow">Propriedade</p><h1>Configurações</h1></div>
  <div className="card">
   <h2>Parâmetros operacionais</h2>
   <p className="muted">Aprovados na Fase 0 e configuráveis por propriedade. Somente administradores podem alterar.</p>
   {notices.erro && <p role="alert" className="alert">Não foi possível salvar as alterações.</p>}
   {notices.aviso && <p className="alert">Parâmetros salvos.</p>}
   {error || !data ? <p className="alert">Configurações indisponíveis.</p> :
   <form action={updateSettings} className="stack">
    <input type="hidden" name="slug" value={organization.slug}/>
    <label className="field"><span>Proporção máxima da pré-venda de colheita (0 a 1)</span>
     <input name="preorder_ratio" type="number" step="0.001" min="0" max="1" required defaultValue={Number(data.preorder_ratio)}/></label>
    <label className="field"><span>Validade Pix manual (horas)</span>
     <input name="pix_manual_reservation_hours" type="number" min="1" max="72" required defaultValue={data.pix_manual_reservation_hours}/></label>
    <label className="field"><span>Validade gateway automático (horas)</span>
     <input name="gateway_reservation_hours" type="number" min="1" max="24" required defaultValue={data.gateway_reservation_hours}/></label>
    <label className="field"><span>Variação de pesagem que exige aprovação (0 a 1)</span>
     <input name="weighing_review_ratio" type="number" step="0.0001" min="0" max="1" required defaultValue={Number(data.weighing_review_ratio)}/></label>
    <button className="btn" style={{ justifySelf:'start' }}>Salvar configurações</button>
   </form>}
  </div>
 </>;
}
