# Ademis Horti
**Gestão do campo ao cliente.** SaaS B2B da Akilli Brasil para pequenos produtores rurais.

## Situação e escopo
Fase 1 — Fundação SaaS, disponível na branch de implementação para revisão. Inclui Next.js, Supabase Auth/SSR, organizações isoladas por RLS, equipe, controle de recursos Essencial/Pro, configurações e backoffice técnico.

Ainda NÃO inclui gestão real de produtos, pedidos, estoque transacional, Pix, entregas ou produção. Esses módulos pertencem às próximas fases. Não há ambiente homologado nem publicação de produção.

Documentação da Fase 0: https://drive.google.com/drive/folders/1lr4R_qdgsTr57BbYONMk-DiQ0291el2v

## Stack
Next.js 15, React 19, TypeScript, Tailwind 3, PostgreSQL/Supabase, Supabase Auth/SSR, Vercel, Vitest e GitHub Actions.

## Desenvolvimento local
1. Instale Node.js 22, Docker e npm.
2. Rode: npm install, depois npx supabase start.
3. Copie .env.example para .env.local e preencha URL e chave anônima do Supabase local, além de NEXT_PUBLIC_SITE_URL=http://localhost:3000.
4. Execute npx supabase db reset (APENAS em banco local).
5. Execute npm run dev, e abra http://localhost:3000.
6. Para validar: npm run lint; npm run typecheck; npm test; npm run build.

**Controle de dependências:** falta gerar package-lock.json com registro npm disponível. Antes de lançar, gere e revise o lockfile e troque npm install por npm ci na CI.

## Supabase em nuvem
Crie um projeto Supabase exclusivamente para o Ademis Horti, distinto dos demais produtos Akilli. Homologação e produção também devem ser separadas. Configure redirect URLs incluindo /auth/callback e aplique a migração versionada com Supabase CLI, após revisão do SQL.

Após cadastrar e confirmar o usuário que gerenciará a Akilli, defina seu UUID de auth.users como administrador manualmente no SQL Editor privilegiado:

    INSERT INTO public.app_admins(user_id) VALUES ('UUID_AUTORIZADA');

Não crie endpoint público para designar administrador Akilli. Contas criadas normalmente recebem plano Essencial com status trialing, sem prazo de teste comercial definido — configure a política de trial antes de liberar contratação externa.

## Vercel
Importe akillibrasil-dev/ademis-horti como Next.js e cadastre por ambiente:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL (URL HTTPS da aplicação, permitida em Supabase Auth)

Nunca incluir chave service_role, senha do PostgreSQL ou segredos financeiros em NEXT_PUBLIC ou no repositório. Valide login, e-mail, RLS, empresas e administração numa preview privada antes de publicar.

## Perfis e regras
ORG_ADMIN gerencia sua propriedade; OPERATOR e DELIVERY recebem acesso limitado; administrador Akilli é separado e não lê pedidos alheios automaticamente. Na Fase 1 só é possível adicionar membros com conta pré-cadastrada e e-mail confirmado; convites sem cadastro serão evolução futura.

Planos e recursos são registrados em plan_features. Backend valida acesso com RPC org_has_feature e RLS; esconder menu não autoriza operações.

Configurações iniciais por empresa da Fase 0: pré-venda de colheita própria até 70% estimado, Pix manual 12h, gateway 2h, revisão de peso acima de 5%. Por enquanto o painel registra parâmetros; sua execução transacional virá nas fases de pedidos.

Consulte docs/FASE-1.md e docs/SEGURANCA.md antes do merge.
