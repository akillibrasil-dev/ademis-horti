import Link from 'next/link';
import { signIn } from '@/lib/actions/auth';
export default async function Login({ searchParams }: {
 searchParams: Promise<{ erro?: string; aviso?: string }>
}) {
 const { erro, aviso } = await searchParams;
 return <main className="shell" style={{ maxWidth: 500, paddingTop: 65 }}>
  <Link className="brand" href="/">Ademis Horti</Link>
  <div className="card" style={{ marginTop: 24 }}>
   <p className="eyebrow">Bem-vindo de volta</p><h1>Acessar minha conta</h1>
   {erro && <p role="alert" className="alert">Não foi possível entrar. Confira e-mail e senha.</p>}
   {aviso === 'confirmar' && <p className="alert">Verifique seu e-mail e confirme o cadastro antes de entrar.</p>}
   <form action={signIn}>
    <label className="field"><span>E-mail</span><input type="email" name="email" required autoComplete="email"/></label>
    <label className="field"><span>Senha</span><input type="password" name="password" minLength={8} required autoComplete="current-password"/></label>
    <button className="btn" type="submit" style={{ width:'100%' }}>Entrar</button>
   </form>
   <p className="muted">Ainda não tem acesso? <Link href="/registrar" style={{ textDecoration:'underline' }}>Criar conta</Link></p>
  </div>
 </main>;
}
