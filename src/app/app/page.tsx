import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { signOut } from '@/lib/actions/auth';

export default async function Organizations() {
 const { supabase, user } = await requireUser();
 const { data, error } = await supabase.from('organizations').select('id,name,slug,status,subscriptions(plan_code,status)').order('created_at', { ascending: false });
 return <main className="shell stack">
  <header className="head">
   <Link href="/" className="brand" style={{ fontSize: 24 }}>Ademis Horti</Link>
   <form action={signOut}><button className="btn btn-secondary">Sair</button></form>
  </header>
  <div className="head"><div><p className="eyebrow">Meu acesso</p><h1>Propriedades</h1><p className="muted">{user.email}</p></div>
   <Link href="/app/nova" className="btn">+ Cadastrar propriedade</Link>
  </div>
  {error && <p className="alert">Não foi possível carregar as propriedades. Confira a configuração do banco e tente novamente.</p>}
  <div className="grid3">
   {(data ?? []).map(org => <Link key={org.id} href={'/app/' + org.slug} className="card">
     <p className="eyebrow">Propriedade</p><h2>{org.name}</h2><p className="muted">/{org.slug} · {org.status}</p><strong>Acessar →</strong>
    </Link>)}
  </div>
  {!error && data?.length === 0 && <p className="card muted">Você ainda não participa de uma propriedade. Crie sua primeira organização para começar.</p>}
 </main>;
}
