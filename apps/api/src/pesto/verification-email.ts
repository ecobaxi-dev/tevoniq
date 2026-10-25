// Email-client compatible markup: tables, inline styles and readable text branding.
// No remote assets are required to read the message or copy its code.
const copy = {
  ar: {
    preheader: 'رمز التحقق لبريدك في بيستو. أكمل التسجيل داخل التطبيق.',
    eyebrow: 'تسجيل بيستو لايت',
    title: 'خطوة واحدة لتأكيد بريدك',
    intro: 'استخدم الرمز أدناه للتحقق من بريدك الإلكتروني في طلب تسجيل بيستو الذي بدأتَه.',
    label: 'رمز التحقق الخاص بك',
    expiry: 'صالح لمدة 20 دقيقة من وقت إنشاء طلب التسجيل',
    instruction: 'ارجع إلى تطبيق بيستو وأدخل هذا الرمز في شاشة التسجيل.',
    note: 'تأكيد البريد وحده لا يبدأ الفترة التجريبية ولا يفعّل الترخيص.',
    security: 'حافظ على سرية الرمز',
    warning: 'لا تشارك هذا الرمز مع أي شخص. إذا لم تطلب التسجيل، يمكنك تجاهل هذه الرسالة.',
    reference: 'مرجع طلب التسجيل',
    help: 'تحتاج إلى مساعدة؟',
    support: 'تواصل مع الدعم',
    website: 'اكتشف بيستو',
    footer: 'حلول ذكية لإدارة مطعمك',
  },
  en: {
    preheader: 'Your Pesto verification code. Complete registration in the app.',
    eyebrow: 'PESTO LITE REGISTRATION',
    title: 'One step to verify your email',
    intro: 'Use the code below to verify your email for the Pesto registration you started.',
    label: 'YOUR VERIFICATION CODE',
    expiry: 'Valid for 20 minutes from the registration request’s creation',
    instruction: 'Return to the Pesto app and enter this code on the registration screen.',
    note: 'Email verification alone does not start a trial or activate a license.',
    security: 'Keep your code private',
    warning:
      'Do not share this code with anyone. If you did not request registration, you can ignore this email.',
    reference: 'Registration request reference',
    help: 'Need a hand?',
    support: 'Contact support',
    website: 'Explore Pesto',
    footer: 'Thoughtful technology for your restaurant',
  },
  tr: {
    preheader: 'Pesto doğrulama kodunuz. Kaydı uygulamada tamamlayın.',
    eyebrow: 'PESTO LITE KAYDI',
    title: 'E-postanızı doğrulamak için son bir adım',
    intro:
      'Başlattığınız Pesto kaydında e-posta adresinizi doğrulamak için aşağıdaki kodu kullanın.',
    label: 'DOĞRULAMA KODUNUZ',
    expiry: 'Kayıt isteğinin oluşturulmasından itibaren 20 dakika geçerlidir',
    instruction: 'Pesto uygulamasına dönün ve bu kodu kayıt ekranına girin.',
    note: 'E-posta doğrulaması tek başına deneme başlatmaz veya lisans etkinleştirmez.',
    security: 'Kodunuzu gizli tutun',
    warning:
      'Bu kodu kimseyle paylaşmayın. Kayıt isteğini siz yapmadıysanız bu e-postayı yok sayabilirsiniz.',
    reference: 'Kayıt isteği referansı',
    help: 'Yardıma mı ihtiyacınız var?',
    support: 'Destek ile iletişime geçin',
    website: 'Pesto’yu keşfedin',
    footer: 'Restoranınız için akıllı teknoloji',
  },
} as const;

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
}

export function verificationEmailHtml(
  language: keyof typeof copy,
  code: string,
  requestId: string,
) {
  const c = copy[language];
  const rtl = language === 'ar';
  const dir = rtl ? 'rtl' : 'ltr';
  const align = rtl ? 'right' : 'left';
  const website = `https://www.tevoniq.com/${language}/pesto`;
  return `<!doctype html>
<html lang="${language}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${c.title}</title></head>
<body style="margin:0;padding:0;background-color:#f3f2ec;color:#252d45;font-family:Tahoma,Arial,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;color:#f3f2ec;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${c.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f2ec"><tr><td align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td bgcolor="#252d45" style="padding:26px 24px;border-radius:18px 18px 0 0;border-bottom:4px solid #e8bb58;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="ltr"><tr>
<td align="left" style="color:#ffffff;font-size:24px;line-height:32px;font-weight:700;letter-spacing:2px;">TEVONIQ</td>
<td align="right" style="color:#f3d38e;font-size:12px;line-height:20px;font-weight:700;letter-spacing:1px;">PESTO<br>LITE</td>
</tr></table></td></tr>
<tr><td bgcolor="#ffffff" dir="${dir}" align="${align}" style="padding:32px 24px;border-radius:0 0 18px 18px;">
<p style="margin:0 0 12px;color:#71603a;font-size:12px;line-height:20px;font-weight:700;letter-spacing:${rtl ? '0' : '1px'};">${c.eyebrow}</p>
<h1 style="margin:0 0 16px;font-size:27px;line-height:1.5;font-weight:700;color:#252d45;">${c.title}</h1>
<p style="margin:0 0 26px;color:#535b6d;font-size:15px;line-height:1.9;">${c.intro}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#f5f4ee" style="padding:24px 8px;border:1px solid #e2dfd4;border-radius:12px;">
<p style="margin:0 0 12px;color:#535b6d;font-size:12px;line-height:20px;font-weight:700;">${c.label}</p>
<div dir="ltr" style="direction:ltr;unicode-bidi:isolate;color:#252d45;font-family:Consolas,'Courier New',monospace;font-size:36px;line-height:48px;font-weight:700;letter-spacing:2px;white-space:nowrap;">${escapeHtml(code)}</div>
<p style="margin:12px 0 0;color:#605844;font-size:12px;line-height:1.8;">${c.expiry}</p>
</td></tr></table>
<p style="margin:24px 0 10px;color:#252d45;font-size:15px;line-height:1.9;font-weight:700;">${c.instruction}</p>
<p style="margin:0 0 26px;color:#535b6d;font-size:13px;line-height:1.9;">${c.note}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td dir="${dir}" align="${align}" style="padding:18px 16px;background-color:#fbf8f0;border-${rtl ? 'right' : 'left'}:3px solid #d9ad4f;">
<p style="margin:0 0 6px;font-size:13px;line-height:1.8;font-weight:700;color:#252d45;">${c.security}</p>
<p style="margin:0;font-size:12px;line-height:1.9;color:#535b6d;">${c.warning}</p>
</td></tr></table>
<p style="margin:26px 0 6px;color:#646b79;font-size:11px;line-height:18px;">${c.reference}</p>
<div dir="ltr" style="direction:ltr;unicode-bidi:isolate;text-align:${align};font-family:Consolas,'Courier New',monospace;font-size:11px;line-height:18px;color:#646b79;overflow-wrap:anywhere;word-break:break-all;">${escapeHtml(requestId)}</div>
</td></tr>
<tr><td align="center" dir="${dir}" style="padding:24px 16px;">
<p style="margin:0 0 10px;color:#535b6d;font-size:12px;line-height:22px;">${c.help} <a href="mailto:kallas.hossam@gmail.com" style="color:#252d45;font-weight:700;text-decoration:underline;">${c.support}</a></p>
<p style="margin:0 0 12px;"><a href="${website}" style="color:#252d45;font-size:12px;font-weight:700;line-height:22px;text-decoration:underline;">${c.website}</a></p>
<p dir="ltr" style="margin:0;color:#252d45;font-size:12px;line-height:22px;font-weight:700;letter-spacing:1px;">TEVONIQ &nbsp; / &nbsp; PESTO</p>
<p style="margin:4px 0 0;color:#646b79;font-size:11px;line-height:20px;">${c.footer}</p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}
