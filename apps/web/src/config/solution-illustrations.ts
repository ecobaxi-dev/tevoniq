import type { Locale } from '@tevoniq/types';

export type SolutionScene =
  'documents' | 'retail' | 'workplace' | 'cloud' | 'access' | 'operations';
export const solutionScenes: Record<string, SolutionScene> = {
  'intelligent-document-workflow': 'documents',
  'connected-retail-operations': 'retail',
  'smart-workplace-experience': 'workplace',
  'secure-digital-access': 'access',
  'business-operations-hub': 'operations',
};
export const illustrationCopy = {
  en: {
    caption: 'Illustrative animation',
    pause: 'Pause',
    resume: 'Play',
    documents: {
      title: 'From documents to reviewed information',
      description:
        'Documents pass through a scanning stage into structured records and a human review queue.',
      labels: ['Documents', 'Extract', 'Review'],
    },
    retail: {
      title: 'One flow across retail operations',
      description:
        'A store, sales terminal and warehouse exchange order and stock information through a connected retail system.',
      labels: ['Sales channels', 'Orders', 'Inventory'],
    },
    workplace: {
      title: 'People and spaces working together',
      description:
        'A meeting room, remote participants and workplace scheduling connect through a shared collaboration hub.',
      labels: ['Meeting spaces', 'Collaboration', 'Remote teams'],
    },
    cloud: {
      title: 'Connected infrastructure and recovery',
      description:
        'Local servers exchange data with a cloud environment and a separate recovery site.',
      labels: ['On premises', 'Hybrid cloud', 'Recovery site'],
    },
    access: {
      title: 'Controlled access to business applications',
      description:
        'People and devices pass through an identity and access-policy checkpoint before reaching protected applications.',
      labels: ['Identity', 'Access policy', 'Applications'],
    },
    operations: {
      title: 'A clear path from request to completion',
      description:
        'Requests enter a shared workspace, move through review and approval, and reach accountable completion.',
      labels: ['Requests', 'Approvals', 'Completion'],
    },
  },
  ar: {
    caption: 'رسم توضيحي متحرك',
    pause: 'إيقاف',
    resume: 'تشغيل',
    documents: {
      title: 'من المستندات إلى معلومات قابلة للمراجعة',
      description: 'تنتقل المستندات عبر مرحلة مسح واستخراج إلى سجلات منظمة وقائمة مراجعة بشرية.',
      labels: ['المستندات', 'الاستخراج', 'المراجعة'],
    },
    retail: {
      title: 'مسار مترابط لعمليات التجزئة',
      description:
        'يتبادل المتجر ونقطة البيع والمستودع معلومات الطلبات والمخزون ضمن منظومة مترابطة.',
      labels: ['قنوات البيع', 'الطلبات', 'المخزون'],
    },
    workplace: {
      title: 'الأشخاص والمساحات يعملون معًا',
      description: 'ترتبط غرفة الاجتماع والمشاركون عن بعد وجدولة المساحات عبر مركز تعاون مشترك.',
      labels: ['غرف الاجتماعات', 'التعاون', 'فرق عن بعد'],
    },
    cloud: {
      title: 'بنية مترابطة واستعادة للبيانات',
      description:
        'تتبادل الخوادم المحلية البيانات مع البيئة السحابية وموقع مستقل لاستعادة الخدمات.',
      labels: ['بيئة محلية', 'سحابة هجينة', 'موقع الاستعادة'],
    },
    access: {
      title: 'وصول منظم إلى تطبيقات الأعمال',
      description:
        'تمر هويات المستخدمين والأجهزة عبر نقطة تحقق من الهوية والصلاحيات قبل الوصول إلى التطبيقات المحمية.',
      labels: ['الهوية', 'سياسة الوصول', 'التطبيقات'],
    },
    operations: {
      title: 'مسار واضح من الطلب إلى الإنجاز',
      description:
        'تصل الطلبات إلى مساحة عمل مشتركة، ثم تنتقل عبر المراجعة والموافقة حتى الإتمام وتحديد المسؤوليات.',
      labels: ['الطلبات', 'الموافقات', 'الإتمام'],
    },
  },
  tr: {
    caption: 'Hareketli kavramsal çizim',
    pause: 'Duraklat',
    resume: 'Oynat',
    documents: {
      title: 'Belgelerden incelenebilir bilgiye',
      description:
        'Belgeler tarama ve çıkarım aşamasından geçerek yapılandırılmış kayıtlara ve insan inceleme kuyruğuna ulaşır.',
      labels: ['Belgeler', 'Bilgi çıkarımı', 'İnceleme'],
    },
    retail: {
      title: 'Bağlantılı perakende operasyonları',
      description:
        'Mağaza, satış terminali ve depo sipariş ve stok bilgilerini ortak bir sistem üzerinden paylaşır.',
      labels: ['Satış kanalları', 'Siparişler', 'Stok'],
    },
    workplace: {
      title: 'İnsanlar ve alanlar birlikte çalışır',
      description:
        'Toplantı alanı, uzaktaki katılımcılar ve alan planlaması ortak bir iş birliği merkezine bağlanır.',
      labels: ['Toplantı alanları', 'İş birliği', 'Uzak ekipler'],
    },
    cloud: {
      title: 'Bağlantılı altyapı ve kurtarma',
      description:
        'Yerel sunucular bulut ortamı ve bağımsız bir kurtarma merkeziyle veri paylaşır.',
      labels: ['Yerel ortam', 'Hibrit bulut', 'Kurtarma ortamı'],
    },
    access: {
      title: 'İş uygulamalarına kontrollü erişim',
      description:
        'Kullanıcı ve cihaz kimlikleri korunan uygulamalara ulaşmadan önce kimlik ve erişim denetiminden geçer.',
      labels: ['Kimlik', 'Erişim politikası', 'Uygulamalar'],
    },
    operations: {
      title: 'Talepten tamamlanmaya net bir yol',
      description:
        'Talepler ortak çalışma alanına girer, inceleme ve onaydan geçer ve sorumlusu belirlenmiş şekilde tamamlanır.',
      labels: ['Talepler', 'Onaylar', 'Tamamlama'],
    },
  },
} satisfies Record<
  Locale,
  { caption: string; pause: string; resume: string } & Record<
    SolutionScene,
    { title: string; description: string; labels: string[] }
  >
>;
