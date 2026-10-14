# Modelo de segurança — Fase 1

Autenticação validada no servidor por Supabase Auth getUser. Middleware SSR mantém cookies nas rotas protegidas. Nenhum getSession é usado como prova de identidade.

Cada organização possui registro independente. Políticas de Row Level Security no PostgreSQL controlam consultas e alterações. organization_members vincula usuário, papel e status ativo. Helpers SECURITY DEFINER conferem somente o vínculo do próprio usuário; todos devem passar por revisão técnica e testes RLS.

Permissões: ORG_ADMIN gerencia configurações/equipe; OPERATOR e DELIVERY são perfis limitados. Rotas Pro são bloqueadas por org_has_feature no backend e não apenas na interface.

Administrador da Akilli não é automaticamente gestor do cliente. app_admins não tem CRUD via browser. platform_organizations retorna metadados mínimos e platform_set_plan verifica privilégio, com auditoria.

Somente ORG_ADMIN pode consultar e-mails dos membros por list_org_members. Equipe adiciona apenas usuário já confirmado; a revogação bloqueia novo acesso. O sistema não permite desativar/rebaixar último administrador.

Nunca usar service_role em NEXT_PUBLIC, JS enviado ao navegador, logs ou artefatos Git. Projetos e credenciais de homologação/produção separados. Backups, teste de restauração e política LGPD obrigatórios antes de dados reais.

Testes: cross-tenant via UUID e RLS, papéis, plano, audit logs, fraude de organização ativa, sessão revogada, impossibilidade de escalar privilégio via API. Não publicar onboarding irrestrito sem controles de abuso.


## Revisão de configuração real — 14/10/2026

Dados consultados sem mutação no Supabase `cfgsntegevijwvbhbbyv`. As migrações `20261009181033_phase1_saas` e `20261009181558_phase1_hardening` estão registradas. No momento da inspeção: 3 usuários Auth, 2 organizações, 3 membros, 2 assinaturas, 4 entradas de auditoria, 0 objetos Storage.

### Advisors Supabase

- **INFO:** `public.app_admins` possui RLS habilitado sem políticas de leitura/escrita para usuários. O comportamento deny-all é intencional e deve ser revisto caso o desenho de acesso mude.
- **WARN:** 10 funções `SECURITY DEFINER` podem ser executadas por `authenticated` por RPC PostgREST: `add_existing_member`, `create_organization`, `is_org_admin`, `is_org_member`, `is_platform_admin`, `list_org_members`, `org_has_feature`, `platform_organizations`, `platform_set_plan` e `remove_member`. Nem toda função exposta é falha, pois algumas RPCs são necessárias; cada função exige revisão do controle interno de autorização, `search_path`, grants e testes de escalada de privilégios. **Não revogar as permissões em produção sem verificar as dependências do aplicativo.**
- **WARN:** proteção contra senhas vazadas desativada no Supabase Auth; avaliar disponibilidade por plano e habilitar antes do onboarding aberto.
- **INFO performance:** 3 índices sem uso observado, insuficiente para indicar que devam ser removidos agora.

Remediações oficiais:
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### Checklist para aprovação de segurança
1. Testar em HML cada RPC com usuário anônimo, membro de organização diferente, OPERATOR, ORG_ADMIN e administrador Akilli; registrar o comportamento esperado e resposta real.
2. Confirmar que funções `SECURITY DEFINER` não fazem acesso a dados de outros tenants sem verificação explícita, que a identidade não pode ser forjada via argumentos ou `auth.uid()`, e que `search_path` está fixado adequadamente.
3. Testar SSR em Preview com `getUser()`, revogação de sessão e tentativa de acesso ao backoffice; examinar bundles/network e verificar ausência de tokens privilegiados.
4. Confirmar tratamento de onboarding, limites antiabuso, MFA para administradores quando cabível e mecanismos de proteção de senhas segundo suporte do plano.
5. Registrar revisor, data e aceite dos riscos remanescentes na Issue #2 **antes de merge/produção**.
