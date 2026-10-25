const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const copy = {
  en: {
    title: 'Your Pesto operating license',
    intro:
      'Your purchase has been activated for the registered restaurant computer. Copy the complete operating permit below into Pesto. Keep this email for your records.',
    label: 'Operating permit',
    note: 'This is a perpetual license. Optional maintenance is separate. The permit works only with its registered installation and device; changing computers requires TEVONIQ support.',
    support: 'Contact support',
    reference: 'Activation reference',
  },
  ar: {
    title: 'تصريح تشغيل بيستو الخاص بك',
    intro:
      'تم تفعيل الشراء للكمبيوتر المسجّل في المطعم. انسخ تصريح التشغيل الكامل أدناه وأدخله في بيستو، واحتفظ بهذه الرسالة للرجوع إليها.',
    label: 'تصريح التشغيل',
    note: 'الترخيص دائم والصيانة الاختيارية منفصلة عنه. يعمل التصريح مع التركيب والجهاز المسجّلين فقط؛ نقل الجهاز يتطلب دعم TEVONIQ.',
    support: 'تواصل مع الدعم',
    reference: 'مرجع التفعيل',
  },
  tr: {
    title: 'Pesto kullanım lisansınız',
    intro:
      'Satın alımınız kayıtlı restoran bilgisayarı için etkinleştirildi. Aşağıdaki kullanım izninin tamamını Pesto’ya girin ve bu e-postayı saklayın.',
    label: 'Kullanım izni',
    note: 'Bu kalıcı bir lisanstır. İsteğe bağlı bakım ayrıdır. İzin yalnızca kayıtlı kurulum ve cihazda çalışır; bilgisayar değişikliği için TEVONIQ desteği gerekir.',
    support: 'Destek ile iletişime geçin',
    reference: 'Etkinleştirme referansı',
  },
};
export function licenseMessage(language: keyof typeof copy, envelope: string, reference: string) {
  const c = copy[language],
    dir = language === 'ar' ? 'rtl' : 'ltr';
  return {
    subject: `${c.title} — TEVONIQ`,
    text: `${c.title}\n\n${c.intro}\n\n${c.label}:\n${envelope}\n\n${c.note}\n\n${c.reference}: ${reference}\n\nTEVONIQ — https://www.tevoniq.com/${language}/pesto\n${c.support}: kallas.hossam@gmail.com`,
    html: `<!doctype html><html lang="${language}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f2ec;color:#252d45;font-family:Tahoma,Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;table-layout:fixed;background:#fff"><tr><td style="padding:24px;background:#252d45;color:#fff;border-bottom:4px solid #e8bb58;font-size:22px;font-weight:bold" dir="ltr">TEVONIQ <span style="color:#f3d38e;font-size:13px">/ PESTO LITE</span></td></tr><tr><td style="padding:28px 24px"><h1 style="font-size:25px;line-height:1.6;margin:0 0 16px">${c.title}</h1><p style="font-size:15px;line-height:1.9">${c.intro}</p><p style="font-weight:bold">${c.label}</p><div dir="ltr" style="direction:ltr;text-align:left;word-break:break-all;overflow-wrap:anywhere;white-space:pre-wrap;padding:16px;background:#f5f4ee;border:1px solid #e2dfd4;font-family:Consolas,monospace;font-size:12px;line-height:1.7">${escapeHtml(envelope)}</div><p style="font-size:13px;line-height:1.9">${c.note}</p><p style="font-size:11px;color:#535b6d">${c.reference}</p><div dir="ltr" style="direction:ltr;word-break:break-all;font-size:11px">${escapeHtml(reference)}</div></td></tr><tr><td align="center" style="padding:20px;border-top:1px solid #e2dfd4;font-size:12px"><a style="color:#252d45" href="mailto:kallas.hossam@gmail.com">${c.support}</a> · <a style="color:#252d45" href="https://www.tevoniq.com/${language}/pesto">TEVONIQ / PESTO</a></td></tr></table></td></tr></table></body></html>`,
  };
}
