import Link from 'next/link';
import { requirePlatformAdmin } from '@/lib/auth';
import { setPlan } from '@/lib/actions/organizations';

type OrganizationRow = { id: string; name: string; slug: string; status: string; plan_code: string; member_count: number };
export default async function Admin({ searchParams }: {
 searchParams: Promise<{ erro?: string; aviso?: string }>
}) {
 const { supabase } = await requirePlatformAdmin();
 const { data, error } = await supabase.rpc('platform_organizations');
 const { erro, aviso } = await searchParams;
 const rows = (data ?? []) as OrganizationRow[];
 return <main className="shell stack">
  <header className="head"><Link className="brand" href="/">Ademis Horti</Link><Link href="/app" className="btn btn-secondary">Minha área</Link></header>
  <div><p className="eyebrow">Akilli Brasil · Gestão da plataforma</p><h1>Administração SaaS</h1>
   <p className="muted">Visão das organizações e habilitação comercial dos planos. Sem acesso a pedidos particulares.</p></div>
  {erro && <p className="alert">Não foi possível alterar o plano.</p>}
  {aviso && <p className="alert">Plano atualizado.</p>}
  {error && <p role="alert" className="alert">Não foi possível consultar a plataforma.</p>}
  <div className="card">
   <table className="table"><thead><tr><th>Organização</th><th>Membros</th><th>Status</th><th>Plano</th></tr></thead>
    <tbody>{rows.map(row=><tr key={row.id}><td><strong>{row.name}</strong><br/><span className="muted">{row.slug}</span></td>
     <td>{row.member_count}</td><td>{row.status}</td><td><form action={setPlan}>
      <input type="hidden" name="organizationId" value={row.id}/>
      <select name="plan" defaultValue={row.plan_code}><option value="ESSENCIAL">Essencial</option><option value="PRO">Pro</option></select>
      {' '}<button type="submit" className="btn">Atualizar</button>
     </form></td>
    </tr>)}</tbody></table>
   {!error && rows.length===0 && <p className="muted">Nenhuma organização cadastrada.</p>}
  </div>
 </main>;
}
