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


## Atualização operacional — 14/10/2026 (prevalece sobre o status histórico de 09/10)

**Backup criptografado externo operacional, com primeira execução agendada concluída; restauração PostgreSQL isolada validada. NÃO equivale a recuperação integral do Supabase.**

### Evidências verificadas
- Script `scripts/backup/export-drive-encrypted.sh`: `pg_dump -Fc` schemas `auth`, `public`, `storage`; copia migrações SQL e manifest, confere SHA-256, cifra com `age` (destinatário público) e transfere somente ciphertext via `rclone` para pasta privada do Google Drive.
- `main`: workflow `.github/workflows/backup-drive.yml` usa checkout de commit fixo da Fase 1, `schedule: '17 6 * * *'` (03h17 BRT nominal), `workflow_dispatch`; **sem** gatilho automático por push. Segredos estão no GitHub Actions, não no código.
- Primeiro cron **success** em 14/10 (houve atraso de ~5h38): https://github.com/akillibrasil-dev/ademis-horti/actions/runs/38559922516; log `BACKUP_UPLOAD_VERIFIED`. Arquivo `ademis-horti-20261014T115522Z-38559922516.tar.gz.age` confirmado no Drive: https://drive.google.com/file/d/1LBndy5RWvPKORLIZoCU82OnMCFtUMW4s/view.
- Recuperação ensaiada em Docker PostgreSQL 17 descartável: https://github.com/akillibrasil-dev/ademis-horti/actions/runs/38397638251. Evidências: download real, descriptografia com `age`, `SHA256SUMS`, `pg_restore --exit-on-error`, consultas de 3 usuários Auth, 2 organizações, 3 vínculos, 2 assinaturas, 0 vínculos órfãos. Segredo temporário com identidade de descriptografia foi removido pelo titular após ensaio.

### Limitações e cuidados obrigatórios
1. A rotina exporta metadados de `storage`, **não exporta os arquivos binários**; por segurança aborta se `storage.objects > 0` — logo, **não é uma solução permanente de backup integral para Storage em uso**.
2. O dump de três schemas não prova restauração de todos os componentes geridos pelo Supabase (configurações Auth, URLs e SMTP, roles, secrets, integrações e storage físico). O ensaio de PostgreSQL não é teste de login em Supabase isolado.
3. RPO e RTO **não foram medidos**, por isso não declarar objetivos de recuperação atingidos. Cron do GitHub pode atrasar e OAuth `rclone` em modo Testing pode expirar.
4. Configurar alertas de jobs com erro, rotação de OAuth, retenção e testes periódicos; guardar a chave privada `age` fora do GitHub, sem incluí-la em mensagens ou repositórios.
5. Nunca executar recuperação no projeto produtivo `cfgsntegevijwvbhbbyv` para testes. Próximo ensaio ampliado deve usar HML isolado e dados fictícios.
6. Rever permanentemente a referência fixa do script no workflow em `main` após evoluções de banco, preservando histórico e reprodutibilidade.

**Gate de backup:** capacidade real de backup cifrado e recuperação de dados PostgreSQL validada; recuperação integral dos serviços Supabase e estratégia para Storage binário ainda dependem de validação e implementação adicional.
