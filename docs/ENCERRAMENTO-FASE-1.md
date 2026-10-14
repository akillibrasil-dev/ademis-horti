# Fase 1 — Plano de fechamento e evidências (atualizado em 14/10/2026)

> Fonte de verdade operacional: Issue #2 e PR #1. Não declarar Fase 1 concluída até os critérios abaixo serem comprovados. Histórico de 09/10 nos documentos anteriores continua válido como registro da época.

## 1. Infraestrutura: isolar HML de PROD — BLOQUEADA
- PROD de referência (ainda com contas de teste): Supabase `cfgsntegevijwvbhbbyv`, **não executar reset, restauração, mutação de tenants ou testes destrutivos aqui**.
- A organização Supabase `Akilli Brasil Ltda.` (ID `qplwewfcykiaevadvysz`) tem dois projetos ativos: `Jaboatão Alerta` e `Ademis Horti`; `Akilli Tracking` apresenta status PAUSING. Consultar preço/plano e pedir autorização de organização e custo antes de provisionar HML.
- Decisão pendente: confirmar organização escolhida para criar `Ademis Horti HML`, alternativa técnica e eventual custo.
- Aceite: projeto Supabase HML diferente de `cfgsntegevijwvbhbbyv`, migrações versionadas aplicadas, Auth/SMTP/redirecionamentos configurados e dados de teste exclusivamente fictícios. Proteger acesso e verificar segredo de cliente separadamente.
- Nunca apontar preview público para PROD.

## 2. Preview Vercel no novo projeto Akilli Brasil — AGUARDANDO HML
- Projeto oficial de desenvolvimento: Vercel equipe `akilli-brasils-projects` (`team_rE6lQvWV3dQp4Tmsa4ZpOvaZ`), projeto `prj_2htyQXWwcdNcx2T3LGOgAbhqtgYn`.
- Conexão GitHub nativa confirmada: `akillibrasil-dev/ademis-horti`.
- Situação atualizada em 14/10: integração Git disparou deployments automáticos da branch de Fase 1; Preview READY (exemplo: `dpl_ApXa9DPUa38VAQBcrJHe3iPqiTro`), **nenhuma variável de ambiente**; por isso build READY não comprova autenticação nem funcionamento conectado ao banco HML. O primeiro commit após vínculo teve deployment inicial etiquetado como `production` pela Vercel (`dpl_41sWtrVVjZEjxv5qAtAXKA4u8Wrh`), SEM promoção autorizada ou configuração de banco: revisar Production Branch no painel antes de qualquer publicação real; SSO segue ativo.
- Configurar **somente Preview** com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable/anon) do **HML** e `NEXT_PUBLIC_SITE_URL` da URL resultante; nunca inserir `service_role`.
- Deploy Preview da branch `feat/fase-1-fundacao-saas`, confirmar estado READY, rota de callback Auth e isolamento; `main` mantém produção separada até liberação.

## 3. AC-C01 a AC-C08 — HOMOLOGAÇÃO FINAL PENDENTE
- AC-C01: signup, confirmação de email, login, criar organização e defaults por RPC transacional.
- AC-C02: dois tenants, negativas SELECT/UPDATE por RLS e rotas, inclusive via UUID alheio.
- AC-C03: adicionar, restringir, remover membro; refletir revogação na próxima requisição.
- AC-C04: negar remoção/rebaixamento do último ORG_ADMIN.
- AC-C05: Essencial bloqueia plantings; Pro libera; somente app_admin Akilli altera plano.
- AC-C06: registrar audit_logs (criação, mutações, plano), conferir autoria/organização.
- AC-C07: verificar bundles, Network e logs sem segredos; SSR `getUser()`.
- AC-C08: Preview -> HML exclusivamente; login/logout/confirmação por email nas URLs publicadas.
- CI do commit `e0238547` aprovada: https://github.com/akillibrasil-dev/ademis-horti/actions/runs/38419809083. **CI não substitui E2E.**
- Registrar evidência por critério (resultado, logs sem dados sensíveis, revisor, data).

## 4. Backup, recuperação e segurança — PARCIALMENTE COMPROVADOS
- Backup agendado (14/10) success: https://github.com/akillibrasil-dev/ademis-horti/actions/runs/38559922516
- Restauração PostgreSQL descartável success (13/10): https://github.com/akillibrasil-dev/ademis-horti/actions/runs/38397638251
- Conferidos no backup restaurado: 3 auth.users, 2 organizações, 3 vínculos, 2 assinaturas, zero órfãos; `storage.objects=0`.
- Limites: ensaio em PostgreSQL não valida SMTP/Auth login completo nem recuperação dos binários Storage, roles globais, segredos/configuração Auth ou tempos RTO/RPO. Script **aborta** quando há objetos no Supabase Storage.
- Supabase Advisor em 14/10: 10 funções `SECURITY DEFINER` invocáveis por `authenticated` (WARN); revisar uma por uma os `GRANT EXECUTE`, as verificações internas de autorização e a superfície PostgREST; aviso INFO `app_admins` com RLS deny-all intencional. Leaked password protection desativada (WARN); avaliar plano e habilitação.
- Referência: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- Adicionar alertas de falha de backup, política de retenção/rotação OAuth e verificação posterior a mudanças no schema.

## 5. Trial/onboarding — PENDENTE APROVAÇÃO COMERCIAL
- Nenhum prazo, cobrança, bloqueio ou conversão automática está aprovado na Fase 1.
- Proposta para aprovação em `docs/POLITICA-TRIAL-E-ONBOARDING.md`; preservar condições existentes dos tenants de teste.
- Definir governança de convite/cadastro, limite de criação, medidas antifraude, suspensão, retenção de dados, upgrade/downgrade e aceitação da cobrança futura.
- Não ativar onboarding público em escala sem políticas e controles.

## 6. Merge e release — NÃO AUTORIZADOS ATÉ OS GATES 1–5
- PR: https://github.com/akillibrasil-dev/ademis-horti/pull/1 — ainda draft, sem merge.
- Fazer revisão de produto/engenharia e conferência do PR, inclusive conflitos com workflows da `main` (backup cron).
- Antes do merge: HML e PROD independentes, E2E aprovado, riscos de segurança tratados/aceitos formalmente, comerciais aprovados e plano de rollback.
- Após merge: build e deployment automático na conta **Akilli Brasil**, smoke test, registrar versão e release.
- Nunca usar o projeto Vercel antigo da Akilli Tracking como destino oficial.

## Responsáveis e aprovação
- Produto: aprovação explícita requerida do responsável pela Akilli Brasil.
- Engenharia: revisor técnico definido antes do merge.
- Status geral em 14/10/2026: **Fase 1 NÃO encerrada**.
