const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

/** Inline styles and presentation tables support mail clients without external assets. */
export function newsletterConfirmationEmail(input: {
  language: 'ar' | 'en';
  confirmationUrl: string;
  unsubscribeUrl: string;
}) {
  const confirmation = new URL(input.confirmationUrl);
  const unsubscribe = new URL(input.unsubscribeUrl);
  if (
    !['https:', 'http:'].includes(confirmation.protocol) ||
    confirmation.username ||
    confirmation.password ||
    unsubscribe.origin !== confirmation.origin ||
    unsubscribe.username ||
    unsubscribe.password
  )
    throw new Error('Invalid newsletter email links');
  const ar = input.language === 'ar';
  const copy = ar
    ? {
        subject: 'خطوة واحدة لتأكيد اشتراكك في نشرة TEVONIQ',
        preheader: 'أكّد بريدك لتصلك أفكارنا ومستجداتنا. رابط التأكيد صالح لمدة 48 ساعة.',
        label: 'نشرة TEVONIQ',
        title: 'أفكار مفيدة.<br>تبدأ بتأكيدك.',
        hello: 'أهلًا بك،',
        body: 'شكرًا لاهتمامك بنشرة TEVONIQ. نشارك أفكارًا عملية عن المواقع وأنظمة العمل والأتمتة، إلى جانب مستجداتنا. بقيت خطوة واحدة لتفعيل اشتراكك.',
        button: 'تأكيد اشتراكي',
        expiry: 'رابط التأكيد صالح لمدة 48 ساعة.',
        pending: 'لن نفعّل اشتراكك في النشرة حتى تؤكد بريدك الإلكتروني.',
        help: 'إذا لم يعمل الزر، يمكنك استخدام',
        fallback: 'رابط التأكيد البديل',
        ignore: 'لم تطلب الاشتراك؟ يمكنك تجاهل هذه الرسالة، ولن نفعّل اشتراكك دون تأكيدك.',
        unsubscribe: 'إلغاء طلب الاشتراك',
        privacy: 'سياسة الخصوصية',
        website: 'زيارة موقعنا',
        note: 'وصلتك هذه الرسالة استجابةً لطلب اشتراك في نشرتنا.',
      }
    : {
        subject: 'One step to confirm your TEVONIQ subscription',
        preheader:
          'Confirm your email for ideas and updates. Your confirmation link is valid for 48 hours.',
        label: 'THE TEVONIQ NEWSLETTER',
        title: 'Useful ideas.<br>Start with your confirmation.',
        hello: 'Welcome,',
        body: 'Thank you for your interest in TEVONIQ. We share practical ideas about websites, business systems and automation, along with our updates. There is just one step left to activate your subscription.',
        button: 'Confirm my subscription',
        expiry: 'Your confirmation link is valid for 48 hours.',
        pending: 'Your newsletter subscription stays inactive until you confirm your email.',
        help: 'If the button does not work, use the',
        fallback: 'alternative confirmation link',
        ignore:
          'Did not request this? Simply ignore this email. We will not activate your subscription without your confirmation.',
        unsubscribe: 'Cancel subscription request',
        privacy: 'Privacy policy',
        website: 'Visit our website',
        note: 'You received this email in response to a newsletter subscription request.',
      };
  const confirmHref = escapeHtml(confirmation.href);
  const unsubscribeHref = escapeHtml(unsubscribe.href);
  const site = escapeHtml(confirmation.origin);
  const align = ar ? 'right' : 'left';
  const text = `${copy.hello}\n\n${copy.body}\n\n${copy.button}:\n${confirmation.href}\n\n${copy.expiry}\n${copy.pending}\n\n${copy.ignore}\n\n${copy.unsubscribe}:\n${unsubscribe.href}\n\nTEVONIQ\n${confirmation.origin}/${input.language}`;
  const html = `<!doctype html>
<html lang="${input.language}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${copy.subject}</title><style>@media only screen and (max-width:620px){.outer{padding:16px 8px!important}.pad{padding:28px 22px!important}.title{font-size:29px!important;line-height:42px!important}}</style></head>
<body style="margin:0;background:#edf2f7;color:#102747;font-family:Tahoma,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${copy.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf2f7"><tr><td class="outer" align="center" style="padding:40px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" dir="${ar ? 'rtl' : 'ltr'}" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dde5ef;border-radius:20px;overflow:hidden;text-align:${align}">
<tr><td class="pad" bgcolor="#0a2041" style="padding:36px 40px;color:#ffffff"><a href="${site}/${input.language}" dir="ltr" style="display:inline-block;color:#ffffff;font:700 27px Arial;letter-spacing:3px;text-decoration:none">TEVONIQ<span style="color:#20d3ee">.</span></a><p style="margin:28px 0 12px;color:#aee9f3;font-size:12px;line-height:22px">${copy.label}</p><h1 class="title" style="margin:0;font-size:34px;line-height:47px;color:#ffffff">${copy.title}</h1></td></tr>
<tr><td height="4" bgcolor="#1ac9e6" style="font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td class="pad" style="padding:32px 40px"><p style="font-size:19px;line-height:30px;margin:0 0 12px;font-weight:bold">${copy.hello}</p><p style="font-size:15px;line-height:28px;color:#53667c;margin:0 0 26px">${copy.body}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#0b3d57" style="border-radius:9px"><a href="${confirmHref}" style="display:block;padding:17px 18px;color:#ffffff;font-size:16px;font-weight:bold;line-height:26px;text-decoration:none">${copy.button}</a></td></tr></table>
<p style="margin:15px 0 6px;font-size:13px;line-height:24px;color:#3f5770;text-align:center">${copy.expiry}</p><p style="margin:0 0 24px;font-size:12px;line-height:23px;color:#53667c;text-align:center">${copy.pending}</p>
<p style="margin:0;font-size:12px;line-height:24px;color:#53667c">${copy.help} <a href="${confirmHref}" style="color:#17637e;text-decoration:underline">${copy.fallback}</a>.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px"><tr><td bgcolor="#eef7fa" style="padding:18px;border:1px solid #cde5ed;border-radius:10px;font-size:12px;line-height:24px;color:#3f5770">${copy.ignore}</td></tr></table>
</td></tr><tr><td class="pad" bgcolor="#f7f9fc" style="padding:24px 40px;border-top:1px solid #e3eaf1"><p style="margin:0 0 12px;font-size:12px;line-height:25px"><a href="${site}/${input.language}" style="color:#17637e">${copy.website}</a> &nbsp; · &nbsp; <a href="${site}/${input.language}/privacy-policy" style="color:#17637e">${copy.privacy}</a><br><a href="${unsubscribeHref}" style="color:#17637e">${copy.unsubscribe}</a></p><p style="margin:0;font-size:11px;line-height:22px;color:#53667c">${copy.note}<br><strong dir="ltr">TEVONIQ</strong></p></td></tr>
</table></td></tr></table></body></html>`;
  return { subject: copy.subject, text, html };
}
