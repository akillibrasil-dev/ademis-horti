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
