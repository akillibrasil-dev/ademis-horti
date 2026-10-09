import { describe, expect, it } from 'vitest';
import { maximumPresaleUnits, mayStartPreparation, needsWeighingReview, POLICY_DEFAULTS } from './policies';

describe('parâmetros aprovados Fase 0', () => {
 it('pré-venda padrão é 70% da previsão sem arredondar para cima', () => {
  expect(POLICY_DEFAULTS.ownHarvestPresaleRatio).toBe(0.7);
  expect(maximumPresaleUnits(100)).toBe(70);
  expect(maximumPresaleUnits(101)).toBe(70);
 });
 it('rejeita previsões e proporções inválidas', () => {
  expect(() => maximumPresaleUnits(-1)).toThrow();
  expect(() => maximumPresaleUnits(100, 1.2)).toThrow();
 });
 it('pagamento apenas informado não autoriza preparação', () => {
  expect(mayStartPreparation('PENDING')).toBe(false);
  expect(mayStartPreparation('REPORTED')).toBe(false);
  expect(mayStartPreparation('CONFIRMED_MANUAL')).toBe(true);
  expect(mayStartPreparation('PAID')).toBe(true);
 });
 it('5% é limiar de revisão e não isenção de ajuste financeiro', () => {
  expect(needsWeighingReview(1,1.04)).toBe(false);
  expect(needsWeighingReview(1,1.05)).toBe(false);
  expect(needsWeighingReview(1,1.06)).toBe(true);
 });
 it('janelas de reserva de Pix manual e gateway são diferentes', () => {
  expect(POLICY_DEFAULTS.pixManualReservationHours).toBe(12);
  expect(POLICY_DEFAULTS.gatewayReservationHours).toBe(2);
 });
});
