import { addMember, removeMember } from '@/lib/actions/organizations';
import { requireOrgAdmin, requireUser } from '@/lib/auth';

type Member = { user_id: string; email: string; role: string; status: string };
export default async function Team({ params, searchParams }: {
 params: Promise<{ orgSlug: string }>;
 searchParams: Promise<{ erro?: string; aviso?: string }>;
}) {
 const { orgSlug } = await params;
 const { organization } = await requireOrgAdmin(orgSlug);
 const { supabase } = await requireUser();
 const { erro, aviso } = await searchParams;
 const { data, error } = await supabase.rpc('list_org_members',{ p_org: organization.id });
 const members = (data ?? []) as Member[];
 return <>
  <div><p className="eyebrow">Permissões</p><h1>Equipe</h1><p className="muted">Associe usuários cadastrados à sua propriedade.</p></div>
  {erro && <p role="alert" className="alert">Não foi possível concluir a operação. Confira se o e-mail já tem cadastro confirmado e se há outro administrador ativo.</p>}
  {aviso && <p className="alert">Alteração realizada com sucesso.</p>}
  <div className="card">
   <h2>Adicionar membro</h2>
   <form action={addMember} className="stack">
    <input type="hidden" name="slug" value={organization.slug}/>
    <label className="field"><span>E-mail já cadastrado no Ademis Horti</span><input name="email" type="email" required/></label>
    <label className="field"><span>Permissão</span><select name="role" defaultValue="OPERATOR">
     <option value="OPERATOR">Operador</option><option value="DELIVERY">Entregador</option>
     <option value="ORG_ADMIN">Administrador da propriedade</option>
    </select></label>
    <button className="btn" style={{ justifySelf:'start' }}>Adicionar</button>
   </form>
  </div>
  <div className="card"><h2>Membros ativos</h2>
   {error && <p className="alert">Não foi possível carregar a equipe. Confira se as migrações estão aplicadas.</p>}
   <table className="table"><thead><tr><th>Usuário</th><th>Papel</th><th></th></tr></thead><tbody>
   {members.map(m=><tr key={m.user_id}><td>{m.email}</td><td>{m.role}</td><td>
    <form action={removeMember}><input type="hidden" name="slug" value={organization.slug}/>
     <input type="hidden" name="userId" value={m.user_id}/>
     <button type="submit" className="btn btn-secondary">Desativar</button></form>
   </td></tr>)}
   </tbody></table>
  </div>
 </>;
}
