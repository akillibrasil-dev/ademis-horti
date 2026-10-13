import Link from 'next/link';
export default function NotFound() {
 return <main className="shell" style={{paddingTop:75,maxWidth:560}}>
  <p className="eyebrow">Ademis Horti</p><h1>Recurso não encontrado</h1>
  <p className="muted">A página não existe ou você não possui permissão para acessá-la.</p>
  <Link className="btn" href="/app">Voltar às propriedades</Link>
 </main>;
}
