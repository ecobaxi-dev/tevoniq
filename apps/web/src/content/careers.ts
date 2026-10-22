const en = {
  title: 'Careers', intro: 'Explore current opportunities and apply for a role that fits your experience.',
  search: 'Search openings', empty: 'There are no matching openings at the moment.', unavailable: 'Openings are temporarily unavailable. Please try again later.',
  all: 'All', employment: 'Employment type', mode: 'Work mode', previous: 'Previous', next: 'Next', openings: 'All openings',
  responsibilities: 'Responsibilities', requirements: 'Requirements', preferred: 'Preferred qualifications', closing: 'Applications close',
  apply: 'Apply for this role', name: 'Full name', email: 'Email', phone: 'Phone (optional)', location: 'Your location',
  linkedIn: 'LinkedIn URL (optional)', portfolio: 'Portfolio URL (optional)', coverLetter: 'Cover letter (optional)',
  cv: 'CV / résumé', cvHelp: 'One PDF file, up to 5 MB. Do not upload encrypted PDFs or files with embedded scripts or attachments.',
  consent: 'I agree that TEVONIQ may use the information and CV I submit to review my job application.',
  privacy: 'Your application and CV are private and available only to authorized hiring staff.',
  submit: 'Submit application', success: 'Your application has been received. Thank you for your interest.',
  error: 'Unable to submit. Please try again.', fileError: 'Choose a PDF CV no larger than 5 MB.',
};
type Copy = { [K in keyof typeof en]: string };
export const careersCopy: Record<'en' | 'tr' | 'ar', Copy> = {
  en,
  tr: {
    title: 'Kariyer', intro: 'Açık pozisyonları inceleyin ve deneyiminize uygun bir role başvurun.', search: 'Pozisyon ara', empty: 'Şu anda eşleşen açık pozisyon bulunmuyor.', unavailable: 'Pozisyonlar şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.',
    all: 'Tümü', employment: 'İstihdam türü', mode: 'Çalışma şekli', previous: 'Önceki', next: 'Sonraki', openings: 'Tüm pozisyonlar', responsibilities: 'Sorumluluklar', requirements: 'Gereksinimler', preferred: 'Tercih edilen nitelikler', closing: 'Son başvuru tarihi',
    apply: 'Bu pozisyona başvur', name: 'Ad soyad', email: 'E-posta', phone: 'Telefon (isteğe bağlı)', location: 'Konumunuz', linkedIn: 'LinkedIn adresi (isteğe bağlı)', portfolio: 'Portfolyo adresi (isteğe bağlı)', coverLetter: 'Ön yazı (isteğe bağlı)', cv: 'Özgeçmiş', cvHelp: 'En fazla 5 MB boyutunda tek bir PDF. Şifreli veya betik ya da dosya eki içeren PDF yüklemeyin.',
    consent: 'TEVONIQ’nun gönderdiğim bilgileri ve özgeçmişi iş başvurumu değerlendirmek için kullanmasını kabul ediyorum.', privacy: 'Başvurunuz ve özgeçmişiniz gizlidir; yalnızca yetkili işe alım çalışanları erişebilir.', submit: 'Başvuruyu gönder', success: 'Başvurunuz alındı. İlginiz için teşekkür ederiz.', error: 'Başvuru gönderilemedi. Lütfen tekrar deneyin.', fileError: 'En fazla 5 MB boyutunda bir PDF seçin.',
  },
  ar: {
    title: 'الوظائف', intro: 'تعرّف على الفرص المتاحة وتقدّم للوظيفة المناسبة لخبراتك.', search: 'ابحث عن وظيفة', empty: 'لا توجد وظائف مطابقة متاحة حاليًا.', unavailable: 'الوظائف غير متاحة مؤقتًا. يُرجى المحاولة لاحقًا.', all: 'الكل', employment: 'نوع التوظيف', mode: 'نمط العمل', previous: 'السابق', next: 'التالي', openings: 'جميع الوظائف', responsibilities: 'المسؤوليات', requirements: 'المتطلبات', preferred: 'المؤهلات المفضلة', closing: 'آخر موعد للتقديم',
    apply: 'تقدّم لهذه الوظيفة', name: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'الهاتف (اختياري)', location: 'موقعك', linkedIn: 'رابط LinkedIn (اختياري)', portfolio: 'رابط معرض الأعمال (اختياري)', coverLetter: 'رسالة التقديم (اختياري)', cv: 'السيرة الذاتية', cvHelp: 'ملف PDF واحد بحجم أقصى 5 ميغابايت. لا ترفع ملفات مشفرة أو تحتوي على نصوص برمجية أو مرفقات.',
    consent: 'أوافق على استخدام TEVONIQ للمعلومات والسيرة الذاتية التي أقدّمها لمراجعة طلب التوظيف.', privacy: 'طلبك وسيرتك الذاتية معلومات خاصة، ولا يمكن الوصول إليها إلا لموظفي التوظيف المخوّلين.', submit: 'إرسال الطلب', success: 'تم استلام طلبك. شكرًا لاهتمامك.', error: 'تعذّر إرسال الطلب. يُرجى المحاولة مجددًا.', fileError: 'اختر سيرة ذاتية بصيغة PDF لا تتجاوز 5 ميغابايت.',
  },
};
export const careerLabel = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
