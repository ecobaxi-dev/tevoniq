import type { Locale } from '@tevoniq/types';
export type DemoKind =
  'ai' | 'cloud' | 'security' | 'integration' | 'software' | 'network' | 'general';
type Step = { title: string; body: string };
const steps = (titles: string[], bodies: string[]): Step[] =>
  titles.map((title, i) => ({ title, body: bodies[i] ?? '' }));
export const demoAliases: Record<Exclude<DemoKind, 'general'>, string[]> = {
  ai: ['Artificial Intelligence', 'Yapay Zekâ', 'الذكاء الاصطناعي'],
  cloud: ['Cloud Solutions', 'Bulut Çözümleri', 'الحلول السحابية'],
  security: ['Cybersecurity', 'Siber Güvenlik', 'الأمن السيبراني'],
  integration: ['System Integration', 'Sistem Entegrasyonu', 'تكامل الأنظمة'],
  software: ['Software Development', 'Yazılım Geliştirme', 'تطوير البرمجيات'],
  network: ['Network Infrastructure', 'Ağ Altyapısı', 'البنية التحتية للشبكات'],
};
export function findDemoKind(title: string): DemoKind {
  return (
    (Object.entries(demoAliases).find(([, aliases]) =>
      aliases.some((alias) => alias.toLocaleLowerCase() === title.trim().toLocaleLowerCase()),
    )?.[0] as DemoKind | undefined) ?? 'general'
  );
}
export const demoCopy: Record<
  Locale,
  {
    label: string;
    close: string;
    play: string;
    pause: string;
    replay: string;
    steps: string;
    motionHint: string;
    scenarios: Record<DemoKind, Step[]>;
  }
> = {
  en: {
    label: 'Illustrative demo',
    close: 'Close demo',
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    steps: 'Demo steps',
    motionHint: 'Choose a step to explore at your own pace.',
    scenarios: {
      ai: steps(
        ['Receive a request', 'Suggest a category', 'Review the suggestion'],
        [
          'An incoming support message enters the workflow.',
          'An AI model suggests a topic so the request can reach the right team.',
          'A person reviews the suggestion before it is used.',
        ],
      ),
      cloud: steps(
        ['Receive traffic', 'Distribute the workload', 'Serve the application'],
        [
          'A customer opens an application.',
          'A cloud routing layer distributes work across application instances.',
          'The selected instance responds through the same entry point.',
        ],
      ),
      security: steps(
        ['Check an attempt', 'Apply access rules', 'Allow or block'],
        [
          'A sign-in attempt reaches the access boundary.',
          'Identity and permission checks evaluate whether access is appropriate.',
          'Authorized access proceeds; an unauthorized attempt is stopped.',
        ],
      ),
      integration: steps(
        ['Create an order', 'Translate the message', 'Update the systems'],
        [
          'An order is created in a sales application.',
          'An integration layer maps the information into the receiving system’s format.',
          'The connected operations system receives the mapped order.',
        ],
      ),
      software: steps(
        ['Define the screen', 'Build the behavior', 'Review the experience'],
        [
          'A wireframe sets out the content and the action a person needs.',
          'The interface gains working fields and a clear action.',
          'The resulting interaction is reviewed before release.',
        ],
      ),
      network: steps(
        ['Send a packet', 'Choose a route', 'Reach the destination'],
        [
          'A device sends information onto the network.',
          'Routing connects the source to an appropriate path.',
          'The packet arrives at the destination across the chosen connection.',
        ],
      ),
      general: steps(
        ['Understand the need', 'Plan the connection', 'Review the approach'],
        [
          'Start with the business problem this layer should address.',
          'Explore how it can connect with the surrounding systems.',
          'Review the proposed approach with the people who will use it.',
        ],
      ),
    },
  },
  tr: {
    label: 'Temsili demo',
    close: 'Demoyu kapat',
    play: 'Oynat',
    pause: 'Duraklat',
    replay: 'Yeniden oynat',
    steps: 'Demo adımları',
    motionHint: 'Kendi hızınızda keşfetmek için bir adım seçin.',
    scenarios: {
      ai: steps(
        ['Talebi alın', 'Kategori önerin', 'Öneriyi inceleyin'],
        [
          'Gelen destek mesajı iş akışına girer.',
          'Yapay zekâ modeli, talebin doğru ekibe ulaşması için bir konu önerir.',
          'Bir kişi, kullanılmadan önce öneriyi inceler.',
        ],
      ),
      cloud: steps(
        ['Trafiği alın', 'İş yükünü dağıtın', 'Uygulamayı sunun'],
        [
          'Bir müşteri uygulamayı açar.',
          'Bulut yönlendirme katmanı, işi uygulama örneklerine dağıtır.',
          'Seçilen örnek aynı giriş noktası üzerinden yanıt verir.',
        ],
      ),
      security: steps(
        ['Girişimi kontrol edin', 'Kuralları uygulayın', 'İzin verin veya engelleyin'],
        [
          'Bir oturum açma girişimi erişim sınırına ulaşır.',
          'Kimlik ve yetki kontrolleri erişimin uygunluğunu değerlendirir.',
          'Yetkili erişim ilerler; yetkisiz girişim durdurulur.',
        ],
      ),
      integration: steps(
        ['Sipariş oluşturun', 'Mesajı dönüştürün', 'Sistemleri güncelleyin'],
        [
          'Satış uygulamasında bir sipariş oluşturulur.',
          'Entegrasyon katmanı bilgileri alıcı sistemin biçimine dönüştürür.',
          'Bağlı operasyon sistemi dönüştürülen siparişi alır.',
        ],
      ),
      software: steps(
        ['Ekranı tanımlayın', 'İşlevi geliştirin', 'Deneyimi inceleyin'],
        [
          'Bir taslak, içeriği ve kişinin ihtiyaç duyduğu eylemi belirler.',
          'Arayüz çalışan alanlar ve açık bir eylem kazanır.',
          'Ortaya çıkan etkileşim yayından önce incelenir.',
        ],
      ),
      network: steps(
        ['Paket gönderin', 'Rotayı seçin', 'Hedefe ulaşın'],
        [
          'Bir cihaz ağa bilgi gönderir.',
          'Yönlendirme, kaynağı uygun bir yola bağlar.',
          'Paket, seçilen bağlantı üzerinden hedefine ulaşır.',
        ],
      ),
      general: steps(
        ['İhtiyacı anlayın', 'Bağlantıyı planlayın', 'Yaklaşımı inceleyin'],
        [
          'Bu katmanın ele alması gereken iş ihtiyacıyla başlayın.',
          'Çevredeki sistemlerle nasıl bağlantı kurabileceğini keşfedin.',
          'Önerilen yaklaşımı onu kullanacak kişilerle inceleyin.',
        ],
      ),
    },
  },
  ar: {
    label: 'عرض توضيحي',
    close: 'إغلاق العرض',
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    replay: 'إعادة العرض',
    steps: 'خطوات العرض',
    motionHint: 'اختر خطوة لاستكشاف العرض بالوتيرة التي تناسبك.',
    scenarios: {
      ai: steps(
        ['استقبال الطلب', 'اقتراح التصنيف', 'مراجعة الاقتراح'],
        [
          'تدخل رسالة دعم واردة إلى مسار العمل.',
          'يقترح نموذج الذكاء الاصطناعي موضوعاً لتوجيه الطلب إلى الفريق المناسب.',
          'يراجع شخص الاقتراح قبل اعتماده.',
        ],
      ),
      cloud: steps(
        ['استقبال الزيارات', 'توزيع العمل', 'تقديم التطبيق'],
        [
          'يفتح أحد العملاء التطبيق.',
          'توزّع طبقة التوجيه السحابية العمل بين نسخ التطبيق.',
          'تستجيب النسخة المختارة عبر نقطة الدخول نفسها.',
        ],
      ),
      security: steps(
        ['فحص المحاولة', 'تطبيق قواعد الوصول', 'السماح أو المنع'],
        [
          'تصل محاولة تسجيل دخول إلى حدود الوصول.',
          'تتحقق قواعد الهوية والصلاحيات من ملاءمة الوصول.',
          'يمر الوصول المصرّح به وتتوقف المحاولة غير المصرّح بها.',
        ],
      ),
      integration: steps(
        ['إنشاء الطلب', 'تحويل الرسالة', 'تحديث الأنظمة'],
        [
          'يُنشأ طلب في تطبيق المبيعات.',
          'تحوّل طبقة التكامل المعلومات إلى الصيغة التي يفهمها النظام المستقبِل.',
          'يتلقى نظام العمليات المتصل الطلب بصيغته المناسبة.',
        ],
      ),
      software: steps(
        ['تحديد الشاشة', 'بناء الوظائف', 'مراجعة التجربة'],
        [
          'يحدّد مخطط أولي المحتوى والإجراء الذي يحتاجه المستخدم.',
          'تكتسب الواجهة حقولاً وظيفية وإجراءً واضحاً.',
          'تُراجع التجربة الناتجة قبل الإصدار.',
        ],
      ),
      network: steps(
        ['إرسال البيانات', 'اختيار المسار', 'الوصول للوجهة'],
        [
          'يرسل جهاز حزمة بيانات إلى الشبكة.',
          'يربط التوجيه المصدر بمسار مناسب.',
          'تصل الحزمة إلى وجهتها عبر الاتصال المختار.',
        ],
      ),
      general: steps(
        ['فهم الاحتياج', 'تخطيط الاتصال', 'مراجعة النهج'],
        [
          'نبدأ باحتياج الأعمال الذي ينبغي لهذه الطبقة معالجته.',
          'نستكشف اتصالها بالأنظمة المحيطة.',
          'نراجع النهج المقترح مع الأشخاص الذين سيستخدمونه.',
        ],
      ),
    },
  },
};
