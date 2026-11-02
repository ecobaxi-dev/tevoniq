const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

/** Table layout and inline styles deliberately support email clients without scripts or remote assets. */
export function confirmationHtml(input: {
  name: string;
  reference: string;
  quote: boolean;
  origin: string;
  locale?: 'ar' | 'en';
}) {
  const ar = input.locale === 'ar';
  const locale = ar ? 'ar' : 'en';
  const origin = new URL(input.origin);
  if (!['https:', 'http:'].includes(origin.protocol) || origin.username || origin.password)
    throw new Error('Invalid email origin');
  const site = escapeHtml(origin.origin);
  const name = escapeHtml(input.name),
    reference = escapeHtml(input.reference);
  const copy = ar
    ? {
        type: input.quote ? 'طلب عرض سعر' : 'رسالة تواصل',
        status: 'تم الاستلام بنجاح',
        title: input.quote ? 'لنحوّل احتياجك<br>إلى خطة واضحة.' : 'بداية تواصل.<br>وفرص جديدة.',
        hello: `مرحبًا ${name}،`,
        body: input.quote
          ? 'وصلنا طلب عرض السعر. سنراجع متطلباتك ونتواصل معك لتوضيح النطاق والخطوة المناسبة لمشروعك.'
          : 'شكرًا لتواصلك مع TEVONIQ. وصلتنا رسالتك، وسنراجع تفاصيلها ونتواصل معك عبر بيانات الاتصال التي شاركتها.',
        reference: 'رقم طلبك المرجعي',
        keep: 'احتفظ بهذا الرقم واذكره عند متابعة طلبك.',
        next: 'ماذا يحدث بعد ذلك؟',
        steps: [
          ['نفهم احتياجك', 'نراجع التفاصيل ونحدد ما يحتاج إلى توضيح.'],
          ['نتواصل معك', 'نناقش أهدافك والأسئلة المتعلقة بطلبك.'],
          ['نحدد الخطوة التالية', 'نتفق على مسار واضح يناسب احتياجك.'],
        ],
        cta: 'لديك تفاصيل إضافية؟ تواصل معنا',
        footer: 'إسطنبول، تركيا',
        website: 'استكشف TEVONIQ',
        privacy: 'الخصوصية',
        note: 'هذه رسالة لتأكيد استلام طلبك، وليست عرض سعر أو اتفاقًا على التنفيذ.',
        tagline: 'حلول رقمية تنظّم أعمالك',
      }
    : {
        type: input.quote ? 'quote request' : 'enquiry',
        status: 'SUCCESSFULLY RECEIVED',
        title: input.quote
          ? 'Your idea.<br>A clearer way forward.'
          : 'A conversation.<br>New possibilities.',
        hello: `Hello ${name},`,
        body: input.quote
          ? 'Your quote request has arrived. We will review your requirements and contact you to clarify the scope and a suitable next step for your project.'
          : 'Thank you for contacting TEVONIQ. We have received your message and will follow up using the contact details you shared.',
        reference: 'YOUR REQUEST REFERENCE',
        keep: 'Keep this number and include it when following up.',
        next: 'What happens next?',
        steps: [
          ['Understand your needs', 'We review the details and identify any questions.'],
          ['Connect with you', 'We discuss your goals and clarify your request.'],
          ['Define the next step', 'We agree on a clear way forward for your needs.'],
        ],
        cta: 'Have more details? Contact us',
        footer: 'Istanbul, Türkiye',
        website: 'Explore TEVONIQ',
        privacy: 'Privacy',
        note: 'This email confirms receipt of your request. It is not a quotation or an agreement to deliver work.',
        tagline: 'Digital solutions that organise your business',
      };
  const align = ar ? 'right' : 'left';
  const steps = copy.steps
    .map(
      ([title, body], index) =>
        `<tr><td width="42" valign="top" style="padding:16px 0;border-bottom:1px solid #e9eef3"><span style="font:700 18px/28px Arial;color:#008da7">0${index + 1}</span></td><td style="padding:16px 0;border-bottom:1px solid #e9eef3;font-size:15px;line-height:25px"><strong style="color:#102747">${title}</strong><br><span style="color:#617184">${body}</span></td></tr>`,
    )
    .join('');
  return `<!doctype html><html lang="${locale}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${copy.status} — TEVONIQ</title><style>@media only screen and (max-width:620px){.outer{padding:16px 8px!important}.pad{padding:26px 22px!important}.title{font-size:31px!important;line-height:43px!important}}</style></head>
<body style="margin:0;background:#edf2f7;font-family:Tahoma,Arial,sans-serif;color:#102747"><div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${copy.status} · ${copy.type} — TEVONIQ</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#edf2f7"><tr><td class="outer" align="center" style="padding:40px 16px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" dir="${ar ? 'rtl' : 'ltr'}" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dde5ef;border-radius:20px;overflow:hidden;text-align:${align}">
<tr><td class="pad" bgcolor="#0a2041" style="padding:35px 40px;background:#0a2041;background-image:linear-gradient(125deg,#0a2041,#104c65);color:#ffffff"><a href="${site}/${locale}" dir="ltr" style="display:inline-block;color:#ffffff;font:700 27px Arial;letter-spacing:3px;text-decoration:none">TEVONIQ<span style="color:#20d3ee">.</span></a><p style="margin:12px 0 30px;color:#c5e6ed;font-size:12px;line-height:22px">${copy.tagline}</p><span style="color:#b9efce;font-size:12px;font-weight:bold">✓ &nbsp; ${copy.status}</span><h1 class="title" style="font-size:38px;line-height:51px;margin:17px 0;color:#ffffff">${copy.title}</h1><p style="margin:0;color:#aee9f3;font-size:13px">${copy.type}</p></td></tr>
<tr><td height="4" bgcolor="#1ac9e6" style="font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td class="pad" style="padding:32px 40px"><p style="font-size:18px;line-height:30px;margin:0 0 12px;font-weight:bold">${copy.hello}</p><p style="font-size:15px;line-height:28px;color:#53667c;margin:0 0 25px">${copy.body}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef7fa" style="background:#eef7fa;border:1px solid #cde5ed;border-radius:12px"><tr><td style="padding:20px"><p style="margin:0 0 10px;color:#37637a;font-size:12px;font-weight:bold">${copy.reference}</p><div dir="ltr" style="direction:ltr;unicode-bidi:isolate;text-align:left;font:700 12px/24px 'Courier New',monospace;color:#102747;word-break:break-all">${reference}</div><p style="margin:10px 0 0;font-size:12px;line-height:21px;color:#617184">${copy.keep}</p></td></tr></table>
<h2 style="font-size:20px;margin:29px 0 0">${copy.next}</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${steps}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px"><tr><td align="center" bgcolor="#0b3d57" style="border-radius:9px"><a href="${site}/${locale}/contact" style="display:block;padding:17px 16px;color:#ffffff;font-size:14px;font-weight:bold;line-height:24px;text-decoration:none">${copy.cta} &nbsp; ${ar ? '←' : '→'}</a></td></tr></table>
</td></tr><tr><td class="pad" bgcolor="#f7f9fc" style="padding:25px 40px;border-top:1px solid #e3eaf1"><p style="margin:0 0 12px;color:#3f5770;font-size:12px;line-height:24px"><strong dir="ltr">TEVONIQ</strong> &nbsp; · &nbsp; ${copy.footer}<br><a href="${site}/${locale}" style="color:#17637e">${copy.website}</a> &nbsp; · &nbsp; <a href="${site}/${locale}/privacy-policy" style="color:#17637e">${copy.privacy}</a></p><p style="margin:0;color:#687a8d;font-size:11px;line-height:21px">${copy.note}</p></td></tr></table></td></tr></table></body></html>`;
}
