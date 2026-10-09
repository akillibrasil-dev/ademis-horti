import Link from 'next/link';

export default function Home() {
 return (
  <main className="shell stack" style={{ gap: 45 }}>
   <header className="head" style={{ paddingTop: 14 }}>
    <Link href="/" className="brand" style={{ fontSize: 25 }}>Ademis Horti</Link>
    <nav className="head">
     <Link href="/entrar" className="btn btn-secondary">Entrar</Link>
     <Link href="/registrar" className="btn">Criar conta</Link>
    </nav>
   </header>
   <section style={{ padding: '45px 0 10px', maxWidth: 750 }}>
    <p className="eyebrow">Uma solução da Akilli Brasil</p>
    <h1>Gestão do campo ao cliente.</h1>
    <p className="muted" style={{ fontSize: 19, lineHeight: 1.7 }}>
     O Ademis Horti conecta comercialização, estoque, pedidos e entregas em um único lugar.
     Com o Pro, a gestão também integra produção agrícola, fornecedores e processamento.
    </p>
    <div className="head" style={{ justifyContent: 'flex-start', marginTop: 24 }}>
     <Link href="/registrar" className="btn">Começar</Link>
     <Link href="/entrar" className="btn btn-secondary">Já tenho acesso</Link>
    </div>
   </section>
   <section className="grid3">
    <article className="card"><span className="eyebrow">Essencial</span><h2>Venda e organize</h2><p className="muted">Catálogo, clientes, pedidos, controle de estoque, Pix manual e entregas.</p></article>
    <article className="card"><span className="eyebrow">Pro</span><h2>Produza e planeje</h2><p className="muted">Plantios, colheitas, compras, fichas técnicas e demanda integrada.</p></article>
    <article className="card"><span className="eyebrow">SaaS multiempresa</span><h2>Seu próprio ambiente</h2><p className="muted">Usuários, permissões e dados isolados para cada propriedade.</p></article>
   </section>
   <footer className="muted" style={{ paddingBottom: 25 }}>Akilli Brasil · Ademis Horti · Fundação SaaS — Fase 1</footer>
  </main>
 );
}
