import Link from 'next/link';
import { createOrganization } from '@/lib/actions/organizations';
import { requireUser } from '@/lib/auth';
export default async function NewOrganization({ searchParams }: {
 searchParams: Promise<{ erro?: string }>
}) {
 await requireUser();
 const { erro } = await searchParams;
 return <main className="shell" style={{ maxWidth: 620 }}>
  <Link href="/app" className="muted">← Minhas propriedades</Link>
  <div className="card" style={{ marginTop: 25 }}>
   <p className="eyebrow">Primeiro passo</p><h1>Cadastrar propriedade</h1>
   <p className="muted">Cada propriedade tem seus próprios usuários, produtos e dados. O plano inicial é Essencial.</p>
   {erro && <p role="alert" className="alert">Não foi possível criar a propriedade. Confira os dados e se o endereço já existe.</p>}
   <form action={createOrganization}>
    <label className="field"><span>Nome da propriedade</span><input name="name" required minLength={3} maxLength={120} placeholder="Horta Exemplo"/></label>
    <label className="field"><span>Endereço curto (letras minúsculas e hífens)</span><input name="slug" required minLength={3} maxLength={50} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="horta-exemplo"/></label>
    <button className="btn" type="submit">Criar propriedade</button>
   </form>
  </div>
 </main>;
}
