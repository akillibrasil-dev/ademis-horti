/**
 * Defaults from Fase 0. UI helpers only; RLS/RPC control authorization.
 */
export const POLICY_DEFAULTS = Object.freeze({
 ownHarvestPresaleRatio: 0.7,
 pixManualReservationHours: 12,
 gatewayReservationHours: 2,
 weighingReviewRatio: 0.05,
});

export type PaymentState = 'PENDING' | 'REPORTED' | 'CONFIRMED_MANUAL' | 'PAID' | 'FAILED';

export function mayStartPreparation(payment: PaymentState): boolean {
 return payment === 'CONFIRMED_MANUAL' || payment === 'PAID';
}

export function maximumPresaleUnits(estimated: number, ratio: number = POLICY_DEFAULTS.ownHarvestPresaleRatio) {
 if (!Number.isSafeInteger(estimated) || estimated < 0) throw new RangeError('Invalid quantity');
 if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) throw new RangeError('Invalid ratio');
 return Math.floor(estimated * ratio);
}

export function needsWeighingReview(estimated: number, actual: number, threshold: number = POLICY_DEFAULTS.weighingReviewRatio) {
 if (!Number.isFinite(estimated) || !Number.isFinite(actual) || !Number.isFinite(threshold)
  || estimated <= 0 || actual < 0 || threshold < 0 || threshold > 1) throw new RangeError('Invalid quantity');
 return Math.abs(actual - estimated) / estimated > threshold;
}
