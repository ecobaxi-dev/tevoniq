// Public release files inspected on Google Drive, 27 November 2026.
// Availability of these files does not enable registration or licensing services.
export const pestoDownloads = {
  windows: {
    href: 'https://drive.usercontent.google.com/download?id=1AJAjkWdW4LuPCM-aMrtRHoiLlIulSUJ2&export=download&confirm=t',
    filename: 'PestoLite-Windows-1.3.4.zip',
    size: '387 MB',
  },
  android: {
    href: 'https://drive.usercontent.google.com/download?id=1xEqQLlFxWcnvOUPGEbaRhiGXAktj-0NX&export=download&confirm=t',
    filename: 'PestoLite-Android-1.3.4.apk',
    size: '68 MB',
  },
} as const;

export const pestoDownloadGuide = {
  ar: {
    title: 'ابدأ على الكمبيوتر الرئيسي',
    steps: [
      'نزّل حزمة Windows؛ ملفات البرنامج مجمّعة في ملف ZIP واحد.',
      'بعد اكتمال التنزيل، انقر بزر الفأرة الأيمن على الملف واختر «استخراج الكل».',
      'افتح المجلد المستخرج ثم افتح Install.cmd واتبع تعليمات التثبيت.',
    ],
    note: 'نزّل تطبيق Android فقط إذا كنت ستستخدم هاتفًا أو جهازًا لوحيًا مع الكمبيوتر الرئيسي. روابط التنزيل تستضيفها Google Drive؛ قد تطلب Google تأكيد التنزيل أو تفرض حدودًا مؤقتة.',
  },
  en: {
    title: 'Start on the main computer',
    steps: [
      'Download the Windows package: the program files come together in one ZIP file.',
      'When the download finishes, right-click the ZIP file and choose “Extract All”.',
      'Open the extracted folder, then open Install.cmd and follow the installation instructions.',
    ],
    note: 'Download Android only for a phone or tablet that will connect to the main computer. Downloads are hosted by Google Drive; Google may ask for download confirmation or apply temporary limits.',
  },
} as const;
