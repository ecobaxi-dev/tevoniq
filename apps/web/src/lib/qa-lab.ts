export type QaScenario = 'checkout' | 'booking' | 'permissions';
export type QaMode = 'before' | 'after';
export const qaScenarioIds: QaScenario[] = ['checkout', 'booking', 'permissions'];
// Deliberately flawed and corrected sample rules. No customer system is contacted.
export function qaSampleTotal(quantity: number, corrected: boolean): number | null {
  if (corrected && (!Number.isInteger(quantity) || quantity < 1 || quantity > 10)) return null;
  return quantity * 50;
}
export function qaSampleSlot(slot: string, corrected: boolean): boolean {
  return corrected ? ['10:00', '11:00', '12:00'].includes(slot) && slot !== '10:00' : true;
}
export function qaSampleApproval(role: string, corrected: boolean): boolean {
  return corrected ? role === 'supervisor' : role !== 'guest';
}
export function runQaExample(scenario: QaScenario, mode: QaMode) {
  const corrected = mode === 'after';
  const cases =
    scenario === 'checkout'
      ? [
          { id: 'total', expected: 100, actual: qaSampleTotal(2, corrected) },
          { id: 'zero', expected: null, actual: qaSampleTotal(0, corrected) },
          { id: 'fraction', expected: null, actual: qaSampleTotal(1.5, corrected) },
          { id: 'limit', expected: null, actual: qaSampleTotal(11, corrected) },
        ]
      : scenario === 'booking'
        ? [
            { id: 'available', expected: true, actual: qaSampleSlot('11:00', corrected) },
            { id: 'occupied', expected: false, actual: qaSampleSlot('10:00', corrected) },
            { id: 'empty', expected: false, actual: qaSampleSlot('', corrected) },
          ]
        : [
            { id: 'supervisor', expected: true, actual: qaSampleApproval('supervisor', corrected) },
            { id: 'employee', expected: false, actual: qaSampleApproval('employee', corrected) },
            { id: 'unknown', expected: false, actual: qaSampleApproval('unknown', corrected) },
          ];
  return cases.map((item) => ({ ...item, passed: Object.is(item.expected, item.actual) }));
}
