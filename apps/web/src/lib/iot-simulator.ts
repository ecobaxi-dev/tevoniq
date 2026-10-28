import { iotCopy, iotScenarios, type IotLocale } from '../content/iot-service.ts';
export type IotState = 'normal' | 'alert' | 'stale' | 'offline';
export type IotResult =
  | {
      ok: true;
      state: IotState;
      value: number | null;
      threshold: number;
      age: number;
      percentage: number | null;
    }
  | { ok: false };
export function evaluateIotReading(input: {
  scenario: string;
  value: string;
  threshold: string;
  age: string;
  connected: boolean;
}): IotResult {
  const scenario = iotScenarios.find((item) => item.id === input.scenario);
  if (!scenario || ![input.value, input.threshold, input.age].every((value) => value.trim() !== ''))
    return { ok: false };
  const value = Number(input.value),
    threshold = Number(input.threshold),
    age = Number(input.age);
  if (
    ![value, threshold, age].every(Number.isFinite) ||
    value < scenario.min ||
    value > scenario.max ||
    threshold < scenario.min ||
    threshold > scenario.max ||
    !Number.isInteger(age) ||
    age < 0 ||
    age > 1440
  )
    return { ok: false };
  if (!input.connected)
    return { ok: true, state: 'offline', value: null, threshold, age, percentage: null };
  const state =
    age > 15
      ? 'stale'
      : (scenario.direction === 'above' ? value > threshold : value < threshold)
        ? 'alert'
        : 'normal';
  return {
    ok: true,
    state,
    value,
    threshold,
    age,
    percentage: Math.max(
      0,
      Math.min(100, ((value - scenario.min) / (scenario.max - scenario.min)) * 100),
    ),
  };
}
export function iotLeadMessage(
  query: Record<string, string | string[] | undefined>,
  locale: IotLocale,
): string | undefined {
  if (query.iot === 'scope')
    return locale === 'ar'
      ? 'أرغب في مناقشة ربط جهاز أو مستشعر بلوحة متابعة.\nالجهاز والقراءة والاتصال المتاح والمتطلبات: '
      : 'I would like to discuss connecting a device or sensor to a monitoring view.\nMy device, reading, available connectivity and requirements: ';
  if (typeof query.iot !== 'string') return undefined;
  const scenario = iotCopy[locale].examples.find((item) => item.id === query.iot);
  return scenario
    ? locale === 'ar'
      ? `أرغب في مناقشة سيناريو إنترنت الأشياء: ${scenario.title}.\nالأجهزة ومصدر القراءة والاتصال ومتطلبات المتابعة: `
      : `I would like to discuss an IoT scenario: ${scenario.title}.\nMy devices, reading source, connectivity and monitoring requirements: `
    : undefined;
}
