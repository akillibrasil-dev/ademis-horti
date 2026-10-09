# Ademis Horti — Fase 1 / Fundação SaaS

Documentação de origem: https://drive.google.com/drive/folders/1lr4R_qdgsTr57BbYONMk-DiQ0291el2v

## Entregas já codificadas
- Next.js/TypeScript/Tailwind, estrutura de páginas e CI.
- Login, cadastro, sessão Supabase SSR e callback de e-mail.
- Organizações, membros, perfis e isolamento RLS por organização.
- Planos Essencial e Pro, controle de recursos via org_has_feature.
- Painel das propriedades, gestão de equipe e configurações.
- Backoffice Akilli restrito com mudança de plano e auditoria.
- Testes unitários de funções puras sobre parâmetros aprovados.

## Não executado / pendente de homologação
- npm install, lint, typecheck, testes e build em ambiente com acesso ao registro.
- Migração SQL aplicada em Supabase de homologação.
- Verificação real de RLS cruzado entre organizações.
- Projeto Supabase dedicado, conexão com Vercel e Auth Redirect URLs.
- Backups/restauração, política de dados, limites de trial e primeiros responsáveis.
- Código de produtos, pedidos, estoque e pagamentos (Fase 2+).

## Gate de aceitação da Fase 1

AC-C01: Usuário autenticado cria propriedade. RPC insere de forma transacional organização, ORG_ADMIN, settings com defaults e assinatura ESSENCIAL.

AC-C02: Usuário B, com empresa B, não consegue ler ou atualizar dados da empresa A, mesmo conhecendo os UUIDs de A, seja por query Supabase ou rota protegida.

AC-C03: Gestor A adiciona usuário C previamente registrado; C só vê empresas que participa, não altera settings nem equipe. Após remoção, perde acesso na próxima requisição.

AC-C04: Último administrador não pode ser removido nem ter seu papel rebaixado. Tentar via RPC e interface.

AC-C05: Plano Essencial não possui feature plantings; Pro possui. Somente administrador Akilli autorizado pode mudar o plano; outro usuário recebe erro.

AC-C06: Criação de organização, mutações da equipe, alterações de parâmetros e troca de plano geram audit_logs com usuário/empresa.

AC-C07: Bundle browser e network não exibem segredos privilegiados; auth SSR valida identidade com getUser.

AC-C08: Preview Vercel aponta para Supabase HML separado de PROD; signup, login/logout e confirmação de e-mail funcionam no domínio publicado.

## Critérios para fechar a fase
CI verde; migrations funcionando; RLS testado negativamente com dois tenants; logs auditáveis; segregação de ambiente; revisão de segurança; backups/restauração antes de operar com dados reais. Aprovação técnica e do produto antes do merge para main.

## Pendências e restrições
Definir responsáveis de engenharia, duração dos trials e política de cadastro de organizações. Implementar proteção antiabuso e convites por e-mail antes de abrir onboarding público em escala. Criar package-lock.json e trocar CI para npm ci. Não presumir aceite do Sítio Recanto do Passira como Cliente Zero.


## Execução efetiva — 09/10/2026

- Projeto Supabase exclusivo: cfgsntegevijwvbhbbyv, PostgreSQL 17.11, região us-east-1.
- Migração original homologada estruturalmente: supabase/migrations/20261009181033_phase1_saas.sql; registro remoto de mesma versão.
- Migração de segurança: supabase/migrations/20261009181558_phase1_hardening.sql; registro remoto de mesma versão.
- Banco com 10 tabelas public, todas RLS, 11 políticas, 12 funções inicialmente implantadas, 2 planos, 23 recursos e 36 associações.
- Hardening: remoção de EXECUTE público das funções de gatilho; quatro índices de FK.
- Teste SQL transacional com duas identidades fictícias, dois tenants e ROLLBACK final executado; sem exceções: criação de organizações, RLS SELECT, roles, recursos Essencial, bloqueio de membership alheia, plano não autorizado e último gestor.
- Conferência após ROLLBACK: nenhum usuário ou organização sintético persistido (auth.users=0, organizations=0).
- Supabase Advisors reexecutado: aviso de RLS em app_admins sem policies é deliberado (deny-all); funções de negócio SECURITY DEFINER continuam invocáveis por authenticated mas incluem autorização interna, exigindo revisão periódica e testes E2E.
- Vercel project ID prj_2k2v6hs9M6O7jqSF6JHXzcKcSRuP; URL de referência: https://ademis-horti-akilli-tracking.vercel.app; proteção SSO mantida.
- Variáveis configuradas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (chave pública, protegida nas configurações Vercel) e NEXT_PUBLIC_SITE_URL. Não há service_role.
- Deploy Git inicial do commit 836c1de atingiu estado READY no Vercel; segunda implantação de preview para incorporar NEXT_PUBLIC_SITE_URL foi solicitada.
- CI do commit 836c1de aprovada: lint, typecheck, Vitest e build.

## Gates ainda em aberto

1. **Configuração Auth no dashboard Supabase:** Site URL https://ademis-horti-akilli-tracking.vercel.app; Redirect URLs https://ademis-horti-akilli-tracking.vercel.app/auth/callback e URL específica do preview quando necessário. Essa configuração de administração não está disponível por esta conexão Supabase.
2. **Administrador real:** registrar/confirmar conta Auth e cadastrar seu UUID na tabela app_admins via SQL autorizado. Não criar usuário real ou vincular terceiro sem consentimento explícito.
3. **E2E real:** validar cadastro, confirmação, login, logout, criação de duas organizações, alternância, equipe, parâmetros e mudança de planos no app publicado. O teste SQL transacional não substitui esse ciclo completo.
4. **Git-Vercel:** projeto Vercel criado sem vínculo permanente por falta de permissão de link no repositório (repo_no_access), mas deployments sob demanda a partir da branch funcionam. Conectar repositório com acesso admin no painel da Vercel para CI/CD automático.
5. **Backup e restore:** validar capacidades do plano Supabase e executar ensaio de recuperação antes de receber dados reais.
6. **Lockfile:** package-lock.json ainda não versionado; gerar no ambiente npm acessível e ajustar CI para npm ci.

**Status de conclusão:** Infraestrutura e smoke tests SQL concluídos; homologação integral dependente dos seis gates acima. Não mesclar PR #1 até a validação funcional.
