import { describe,expect,it } from 'vitest';
import { classifySignupError } from './signup-errors';

describe('Supabase Auth signup failure mapping',()=>{
 it('explains Supabase built-in SMTP rate limit (429)',()=>{
   expect(classifySignupError({code:'over_email_send_rate_limit',status:429})).toBe('limite-email');
 });
 it('handles general rate limiting without falsely blaming SMTP',()=>{
   expect(classifySignupError({code:'over_request_rate_limit',status:429})).toBe('limite-tentativas');
 });
 it('handles weak passwords and invalid email',()=>{
   expect(classifySignupError({code:'weak_password',status:422})).toBe('dados');
   expect(classifySignupError({code:'email_address_invalid',status:400})).toBe('dados');
 });
 it('handles service disabled without exposing provider internals',()=>{
   expect(classifySignupError({code:'signup_disabled'})).toBe('indisponivel');
 });
 it('keeps unknown errors and duplicate-email state generic',()=>{
   expect(classifySignupError({code:'user_already_exists',status:422})).toBe('cadastro');
   expect(classifySignupError({code:'internal_server_error',status:500})).toBe('cadastro');
 });
});
