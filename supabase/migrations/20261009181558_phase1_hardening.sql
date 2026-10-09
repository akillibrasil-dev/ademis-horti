-- Ademis Horti — security and performance hardening after phase1_saas
-- Trigger functions are internal only, never RPC endpoints.
revoke all on function public.audit_settings_change() from public, anon, authenticated;
revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;

-- Future-proof indexes for expected foreign-key joins/deletions.
create index if not exists audit_logs_actor_user_id_idx on public.audit_logs(actor_user_id);
create index if not exists organizations_created_by_idx on public.organizations(created_by);
create index if not exists plan_features_feature_code_idx on public.plan_features(feature_code);
create index if not exists subscriptions_plan_code_idx on public.subscriptions(plan_code);

-- An explicit deny-all policy is not required on app_admins:
-- RLS enabled without policies denies access to non-bypass roles.
-- The admin lookup is implemented in the restricted is_platform_admin RPC.
