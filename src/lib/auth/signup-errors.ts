/**
 * Maps Supabase Auth errors to safe, predictable UI messages.
 * Never return error.message or identify whether an account already exists.
 */
export type SignupErrorCode = 'dados' | 'limite-email' | 'limite-tentativas' | 'indisponivel' | 'cadastro';
export function classifySignupError(error: { code?: string | null; status?: number | null }): SignupErrorCode {
 if (error.code === 'over_email_send_rate_limit' || error.code === 'email_rate_limit_exceeded') return 'limite-email';
 if (error.code === 'over_request_rate_limit' || error.status === 429) return 'limite-tentativas';
 if (error.code === 'weak_password' || error.code === 'email_address_invalid' || error.code === 'validation_failed') return 'dados';
 if (error.code === 'signup_disabled' || error.code === 'email_provider_disabled') return 'indisponivel';
 return 'cadastro';
}
