import type {
  AutomationCase,
  AutomationInput,
  AutomationLocale,
} from '../content/automation-cases.ts';
export type StepStatus = 'idle' | 'completed' | 'waiting' | 'skipped' | 'failed';
export type AutomationOutcome =
  'completed' | 'waiting' | 'skipped' | 'failed' | 'duplicate' | 'conflict';
export type AutomationResult = {
  outcome: AutomationOutcome;
  message: string;
  steps: StepStatus[];
  effects: { label: string; value: string }[];
  draft: string;
  fingerprint: string;
};
export type AutomationReceipt = { eventId: string; fingerprint: string; result: AutomationResult };
const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const validMoney = (value: number) => Number.isFinite(value) && value >= 0 && value <= 10000000;
const validCount = (value: number) => Number.isSafeInteger(value) && value >= 0 && value <= 1000000;
export function runAutomationDemo(
  model: AutomationCase,
  input: AutomationInput,
  ledger: AutomationReceipt[],
  locale: AutomationLocale,
  failConnection = false,
): AutomationResult {
  const ar = locale === 'ar',
    pick = (a: string, b: string) => (ar ? a : b);
  const payload = Object.fromEntries(
    model.fields.filter((key) => key !== 'approved').map((key) => [key, input[key]]),
  );
  const fingerprint = JSON.stringify({ flow: model.slug, payload }),
    effects: AutomationResult['effects'] = [];
  const result = (outcome: AutomationOutcome, message: string, index = 1): AutomationResult => ({
    outcome,
    message,
    steps: model[locale].steps.map((_, i) =>
      i < index
        ? 'completed'
        : i === index
          ? outcome === 'waiting'
            ? 'waiting'
            : outcome === 'skipped'
              ? 'skipped'
              : 'failed'
          : 'idle',
    ),
    effects: [],
    draft: '',
    fingerprint,
  });
  if (!input.eventId.trim() || input.eventId.length > 60)
    return result(
      'failed',
      pick('أدخل رقم حدث واضحًا لا يتجاوز 60 حرفًا.', 'Enter an event ID of up to 60 characters.'),
      0,
    );
  if (model.fields.includes('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    return result(
      'failed',
      pick('راجع البريد الإلكتروني في البيانات التجريبية.', 'Check the sample email address.'),
    );
  if (model.fields.includes('amount') && (!validMoney(input.amount) || input.amount === 0))
    return result(
      'failed',
      pick('أدخل قيمة موجبة لا تتجاوز عشرة ملايين.', 'Enter a positive amount up to ten million.'),
    );
  for (const key of ['stock', 'quantity', 'threshold'] as const) {
    if (
      model.fields.includes(key) &&
      !(key === 'threshold' && model.slug !== 'stock-alerts'
        ? validMoney(input[key])
        : validCount(input[key]))
    )
      return result(
        'failed',
        pick('راجع الكميات وحدود القيم المدخلة.', 'Check quantities and configured limits.'),
      );
  }
  if (
    model.slug === 'lead-capture' &&
    (!input.description.trim() || input.description.length > 1000)
  )
    return result(
      'failed',
      pick('أدخل وصفًا موجزًا للاستفسار.', 'Enter a short enquiry description.'),
    );
  for (const key of ['dueDate', 'referenceDate', 'appointmentDate'] as const)
    if (model.fields.includes(key) && !validDate(input[key]))
      return result('failed', pick('أدخل تاريخًا صحيحًا.', 'Enter a valid date.'));
  const previous = ledger.find((receipt) => receipt.eventId === input.eventId.trim());
  if (previous) {
    if (previous.fingerprint !== fingerprint)
      return result(
        'conflict',
        pick(
          'هذا الرقم مرتبط ببيانات مختلفة. استخدم رقم حدث جديدًا.',
          'This ID belongs to different data. Use a new event ID.',
        ),
        0,
      );
    return {
      ...previous.result,
      outcome: 'duplicate',
      message: pick(
        'سبقت معالجة هذا الحدث؛ لم تُنشأ نتيجة إضافية.',
        'This event was already processed; no additional output was created.',
      ),
    };
  }
  let draft = '',
    skipApproval = false;
  const add = (label: string, value: string) => effects.push({ label, value });
  const needsApproval = () => input.amount >= input.threshold && !input.approved;
  const countFormat = (n: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
  if (model.slug === 'lead-capture') {
    add(
      pick('سجل متابعة مقترح', 'Proposed follow-up record'),
      `${input.email} · ${input.description.trim()}`,
    );
    if (input.consent)
      draft = pick(
        `شكرًا لتواصلك. استلمنا استفسارك: ${input.description.trim()}. هذه مسودة توضيحية.`,
        `Thank you for your enquiry: ${input.description.trim()}. This is a sample draft.`,
      );
    else
      add(
        pick('التواصل', 'Contact preference'),
        pick('تسجيل الطلب فقط؛ لا مسودة رسالة.', 'Record only; no message draft.'),
      );
  }
  if (model.slug === 'order-sync') {
    if (input.quantity === 0)
      return result(
        'failed',
        pick(
          'كمية الطلب يجب أن تكون وحدة واحدة على الأقل.',
          'Order quantity must be at least one.',
        ),
      );
    if (input.quantity > input.stock)
      return result(
        'failed',
        pick(
          'الرصيد غير كافٍ. عدّل سيناريو الطلب قبل إعادة المحاولة.',
          'Insufficient stock. Adjust the order scenario before retrying.',
        ),
      );
    if (needsApproval())
      return result(
        'waiting',
        pick(
          'قيمة الطلب بلغت حد المراجعة. فعّل الموافقة التجريبية ثم أعد المحاولة.',
          'The order meets the review threshold. Enable demo approval and retry.',
        ),
        2,
      );
    skipApproval = input.amount < input.threshold;
    add(pick('كمية الطلب', 'Order quantity'), countFormat(input.quantity));
    add(
      pick('الرصيد المقترح بعد الطلب', 'Proposed balance after order'),
      countFormat(input.stock - input.quantity),
    );
    draft = pick(
      `تجهيز طلب ${input.eventId} بكمية ${input.quantity} وقيمة توضيحية ${input.amount} ر.س.`,
      `Prepare order ${input.eventId}: ${input.quantity} units, sample value ${input.amount} SAR.`,
    );
  }
  if (model.slug === 'appointment-reminders') {
    if (input.appointmentDate <= input.referenceDate)
      return result(
        'skipped',
        pick(
          'الموعد ليس بعد التاريخ المرجعي؛ لم يُجهز تذكير.',
          'The appointment is not after the reference date; no reminder was prepared.',
        ),
      );
    if (!input.consent)
      return result(
        'skipped',
        pick(
          'التواصل غير مفعّل؛ تم تجاوز تجهيز التذكير.',
          'Contact is disabled; reminder preparation was skipped.',
        ),
        2,
      );
    const reminder = new Date(`${input.appointmentDate}T00:00:00Z`);
    reminder.setUTCDate(reminder.getUTCDate() - 1);
    add(
      pick('تاريخ التذكير المقترح', 'Proposed reminder date'),
      reminder.toISOString().slice(0, 10),
    );
    add(pick('المستلم التوضيحي', 'Sample recipient'), input.email);
    draft = pick(
      `تذكير توضيحي بموعدك بتاريخ ${input.appointmentDate}.`,
      `Sample reminder for your appointment on ${input.appointmentDate}.`,
    );
  }
  if (model.slug === 'invoice-follow-up') {
    if (input.paid)
      return result(
        'skipped',
        pick(
          'الفاتورة مدفوعة؛ لا متابعة مطلوبة.',
          'The invoice is paid; no follow-up is required.',
        ),
      );
    if (input.dueDate > input.referenceDate)
      return result(
        'skipped',
        pick(
          'لم يحن الاستحقاق وفق التاريخ المرجعي.',
          'The invoice is not due on the reference date.',
        ),
      );
    if (!input.consent)
      return result(
        'waiting',
        pick(
          'فعّل التواصل التجريبي قبل تجهيز المسودة.',
          'Enable demo contact before preparing a draft.',
        ),
        2,
      );
    if (needsApproval())
      return result(
        'waiting',
        pick(
          'القيمة تحتاج مراجعة. فعّل الموافقة التجريبية ثم أعد المحاولة.',
          'This amount requires review. Enable demo approval and retry.',
        ),
        2,
      );
    skipApproval = input.amount < input.threshold;
    add(
      pick('قيمة الفاتورة التوضيحية', 'Sample invoice amount'),
      `${countFormat(input.amount)} ${pick('ر.س', 'SAR')}`,
    );
    draft = pick(
      `مسودة متابعة للفاتورة ${input.eventId} المستحقة بتاريخ ${input.dueDate}، بقيمة ${input.amount} ر.س.`,
      `Follow-up draft for invoice ${input.eventId}, due ${input.dueDate}, sample amount ${input.amount} SAR.`,
    );
  }
  if (model.slug === 'stock-alerts') {
    if (input.stock > input.threshold)
      return result(
        'skipped',
        pick(
          'الرصيد أعلى من حد التنبيه؛ لا طلب مراجعة.',
          'Stock is above the threshold; no review request.',
        ),
      );
    if (!input.approved)
      return result(
        'waiting',
        pick(
          'الصنف يحتاج مراجعة. فعّل الموافقة لتجهيز الطلب التوضيحي.',
          'This item needs review. Enable approval to prepare the sample request.',
        ),
        2,
      );
    add(pick('الرصيد الحالي', 'Current balance'), countFormat(input.stock));
    add(
      pick('كمية مقترحة للمراجعة', 'Suggested review quantity'),
      countFormat(Math.max(input.threshold * 2 - input.stock, 1)),
    );
    draft = pick(
      'مسودة طلب مراجعة توريد. لا تُنشئ عملية شراء فعلية.',
      'Draft supply review request. No actual purchase is created.',
    );
  }
  if (model.slug === 'daily-summary') {
    const rows = input.orders
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim());
    if (!rows.length || rows.length > 20)
      return result(
        'failed',
        pick('أدخل من سجل واحد إلى 20 سجلًا.', 'Enter between one and 20 records.'),
      );
    const ids = new Set<string>();
    let total = 0;
    for (const row of rows) {
      const parts = row.split(',');
      const id = parts[0]?.trim(),
        raw = parts[1]?.trim(),
        amount = Number(raw);
      if (parts.length !== 2 || !id || id.length > 60 || !raw || !validMoney(amount))
        return result(
          'failed',
          pick(
            'كل سطر يجب أن يحتوي رقم طلب وقيمة موجبة أو صفرًا، يفصل بينهما فاصلة إنجليزية.',
            'Each line needs an order ID and a non-negative amount, separated by a comma.',
          ),
        );
      if (ids.has(id))
        return result(
          'failed',
          pick(
            'يوجد رقم طلب مكرر. صحح البيانات لتجنب احتسابه مرتين.',
            'Duplicate order ID. Correct the data to avoid counting it twice.',
          ),
        );
      ids.add(id);
      total += amount;
    }
    add(pick('عدد الطلبات', 'Order count'), countFormat(rows.length));
    add(
      pick('مجموع القيم التوضيحية', 'Sample total value'),
      `${countFormat(total)} ${pick('ر.س', 'SAR')}`,
    );
    add(
      pick('متوسط القيمة', 'Average value'),
      `${countFormat(total / rows.length)} ${pick('ر.س', 'SAR')}`,
    );
    draft = pick(
      `ملخص ${input.referenceDate}: ${rows.length} طلبات، بمجموع توضيحي ${countFormat(total)} ر.س.`,
      `Summary for ${input.referenceDate}: ${rows.length} orders, sample total ${countFormat(total)} SAR.`,
    );
  }
  if (failConnection)
    return result(
      'failed',
      pick(
        'محاكاة تعطل الربط: لم تُسجل نتيجة. أوقف محاكاة العطل وأعد المحاولة بالرقم نفسه.',
        'Simulated connection failure: nothing was committed. Disable the failure and retry with the same ID.',
      ),
      3,
    );
  return {
    outcome: 'completed',
    message: pick(
      'اكتملت المحاكاة وسُجلت النتيجة محليًا فقط.',
      'Simulation completed; the outcome was recorded locally only.',
    ),
    steps: model[locale].steps.map((_, i) =>
      (skipApproval && i === 2) || (model.slug === 'lead-capture' && !input.consent && i === 3)
        ? 'skipped'
        : 'completed',
    ),
    effects,
    draft,
    fingerprint,
  };
}
export function appendAutomationReceipt(
  ledger: AutomationReceipt[],
  eventId: string,
  result: AutomationResult,
): AutomationReceipt[] {
  if (result.outcome !== 'completed' && result.outcome !== 'skipped') return ledger;
  if (ledger.some((receipt) => receipt.eventId === eventId.trim())) return ledger;
  return [...ledger, { eventId: eventId.trim(), fingerprint: result.fingerprint, result }];
}
