# Modelo de segurança — Fase 1

Autenticação validada no servidor por Supabase Auth getUser. Middleware SSR mantém cookies nas rotas protegidas. Nenhum getSession é usado como prova de identidade.

Cada organização possui registro independente. Políticas de Row Level Security no PostgreSQL controlam consultas e alterações. organization_members vincula usuário, papel e status ativo. Helpers SECURITY DEFINER conferem somente o vínculo do próprio usuário; todos devem passar por revisão técnica e testes RLS.

Permissões: ORG_ADMIN gerencia configurações/equipe; OPERATOR e DELIVERY são perfis limitados. Rotas Pro são bloqueadas por org_has_feature no backend e não apenas na interface.

Administrador da Akilli não é automaticamente gestor do cliente. app_admins não tem CRUD via browser. platform_organizations retorna metadados mínimos e platform_set_plan verifica privilégio, com auditoria.

Somente ORG_ADMIN pode consultar e-mails dos membros por list_org_members. Equipe adiciona apenas usuário já confirmado; a revogação bloqueia novo acesso. O sistema não permite desativar/rebaixar último administrador.

Nunca usar service_role em NEXT_PUBLIC, JS enviado ao navegador, logs ou artefatos Git. Projetos e credenciais de homologação/produção separados. Backups, teste de restauração e política LGPD obrigatórios antes de dados reais.

Testes: cross-tenant via UUID e RLS, papéis, plano, audit logs, fraude de organização ativa, sessão revogada, impossibilidade de escalar privilégio via API. Não publicar onboarding irrestrito sem controles de abuso.
