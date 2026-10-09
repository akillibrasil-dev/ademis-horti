import Link from 'next/link';
import { requireOrg } from '@/lib/auth';
import { signOut } from '@/lib/actions/auth';

export default async function OrganizationLayout({
 children, params,
}: { children: React.ReactNode; params: Promise<{ orgSlug: string }> }) {
 const { orgSlug } = await params;
 const { organization: org, role } = await requireOrg(orgSlug);
 const navigation = [
  ['Início',''],['Equipe','/equipe'],['Configurações','/configuracoes'],
 ];
 return <main className="shell stack">
  <header className="head">
   <Link href="/" className="brand" style={{ fontSize: 24 }}>Ademis Horti</Link>
   <div className="head"><Link className="muted" href="/app">Trocar propriedade</Link><form action={signOut}><button className="btn btn-secondary">Sair</button></form></div>
  </header>
  <div className="layout">
   <aside className="sidebar">
    <p className="eyebrow">Sua propriedade</p><h2 style={{ marginTop: 4 }}>{org.name}</h2>
    <p className="muted" style={{ fontSize: 12 }}>Perfil: {role}</p>
    <nav>{navigation.filter(([title])=>title==='Início'||role==='ORG_ADMIN').map(([title,relative]) =>
     <Link href={'/app/'+org.slug+relative} key={relative}>{title}</Link>)}</nav>
   </aside>
   <section className="stack" style={{ alignContent: 'start' }}>{children}</section>
  </div>
 </main>;
}
