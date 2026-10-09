# Recuperação de dados — Ademis Horti

## Situação atual, 09/10/2026
A organização Supabase Akilli Brasil Ltda. está no plano **Free**. Não foi confirmada disponibilidade de backups automáticos; a Supabase documenta backups automáticos diários para planos Pro/Team/Enterprise: https://supabase.com/docs/guides/platform/backups

**Não foi concluído backup integral ou restauração real.** Nunca declarar esse gate aprovado com base em verificação de migrações ou leitura SQL.

## Exportação parcial segura
1. Instalar Docker e dependências (npm ci) no computador autorizado.
2. Copiar a string de conexão correta no painel Supabase e defini-la em SUPABASE_DB_URL sem a divulgar em logs, GitHub ou chat.
3. Executar bash scripts/backup/export-public.sh, com BACKUP_DIR apontando para armazenamento privado fora do Git.
4. Validar SHA256SUMS e guardar o resultado cifrado em localização independente.

A ferramenta supabase db dump ignora por padrão auth, storage e schemas gerenciados: https://supabase.com/docs/reference/cli/supabase-db-dump. Logo esse script **não** recupera login, senhas e todos os vínculos de public com auth.users.

## Gate obrigatório para liberar uso real
- Atualizar para plano com backup gerenciado ou aprovar método externo de backup integral cobrindo Auth e public.
- Fazer backup completo autorizado e cifrado (credenciais e hashes de senhas são informação sensível).
- Provisionar projeto/instância DESCARTÁVEL de restauração, com configurações apropriadas.
- Restaurar em instância distinta usando roteiro oficial: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- Conferir contagens e integridade de auth.users, profiles, organizations, organization_members, subscriptions, app_admins, logs, RLS e migrações.
- Executar login de ensaio, medir RPO/RTO, registrar evidência e aprovação técnica na Issue #2.
- Não restaurar sobre cfgsntegevijwvbhbbyv: é o ambiente com usuários de homologação.

**Gate atual:** documentação e script parcial prontos; execução integral e ensaio isolado exigem acesso autorizado a conexão e ambiente de restauração.
