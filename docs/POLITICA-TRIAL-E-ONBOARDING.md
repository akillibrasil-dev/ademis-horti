# Política de testes, assinaturas e onboarding — Fase 1

## Comportamento real, sem inferir termos comerciais
- create_organization cria assinatura ESSENCIAL com status trialing e current_period_end NULL.
- platform_set_plan altera ESSENCIAL/PRO somente pelo administrador Akilli, com registro de auditoria; não realiza cobrança e não converte trialing para active.
- org_has_feature concede recursos para assinaturas trialing ou active; não aplica vencimento de trial no banco da Fase 1.
- O valor Pro no painel significa liberação de permissões, NÃO assinatura paga.
- A matriz de recursos referencia funcionalidades de fases posteriores e não comprova módulos prontos.
- Cadastro requer e-mail confirmado; equipe adiciona usuários já cadastrados.

## Limites operacionais ATÉ aprovação comercial
1. Uso exclusivo em homologação controlada. Não anunciar trials ilimitados nem liberar onboarding aberto em escala.
2. Não cobrar, renovar, suspender, migrar ou encerrar assinatura automaticamente nesta etapa.
3. Manter Horta Akilli/Pro e Horta do Anthonny/Essencial como estão, sem aplicar validade arbitrária a cadastros preexistentes.
4. Alterações de plano permanecem manuais e auditadas.
5. Exigir política de backup integral/restore antes de receber informações reais de clientes.

## Decisões pendentes antes da operação comercial
- Duração do trial, marco inicial e limite de propriedades por usuário.
- Expiração, bloqueio/leitura, aviso antecipado, conversão expressamente consentida.
- Estratégia antiabuso, limites de criação por usuário/dispositivo e revisão de cadastros.
- Processo de assinatura, upgrade/downgrade e vencimento (sem gateway implementado).
- Política de retenção, privacidade e resposta a incidentes.

Estes itens requerem decisão de produto; **nenhuma regra comercial arbitrária foi programada** para evitar interrupção dos testes.
