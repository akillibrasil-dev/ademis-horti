import Link from 'next/link';
import { signUp } from '@/lib/actions/auth';

export default async function Register({ searchParams }: {
 searchParams: Promise<{ erro?: string }>
}) {
 const { erro } = await searchParams;
 return <main className="shell" style={{ maxWidth: 500, paddingTop: 65 }}>
  <Link className="brand" href="/">Ademis Horti</Link>
  <div className="card" style={{ marginTop: 24 }}>
   <p className="eyebrow">Gestão para pequenos produtores</p><h1>Criar acesso</h1>
   {erro && <p role="alert" className="alert">Confira os dados ou tente novamente.</p>}
   <form action={signUp}>
    <label className="field"><span>Seu nome</span><input name="display_name" minLength={2} maxLength={80} required autoComplete="name"/></label>
    <label className="field"><span>E-mail</span><input name="email" type="email" required autoComplete="email"/></label>
    <label className="field"><span>Senha (mínimo 8 caracteres)</span><input name="password" type="password" minLength={8} required autoComplete="new-password"/></label>
    <button className="btn" type="submit" style={{ width:'100%' }}>Cadastrar</button>
   </form>
   <p className="muted">Já tem conta? <Link href="/entrar" style={{ textDecoration:'underline' }}>Entrar</Link></p>
  </div>
 </main>;
}
