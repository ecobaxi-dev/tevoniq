import type { Locale } from '@tevoniq/types';

type Item = { title: string; body: string };
type AiDevelopmentCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  primary: string;
  secondary: string;
  nav: string[];
  principles: string[];
  overview: string;
  overviewBody: string;
  challenge: string;
  response: string;
  comparisons: { problem: string; solution: string }[];
  consulting: string;
  consultingIntro: string;
  consultingItems: Item[];
  engineering: string;
  engineeringIntro: string;
  engineeringItems: Item[];
  examples: string;
  exampleNote: string;
  exampleItems: Item[];
  approach: string;
  approachIntro: string;
  stages: (Item & { output: string })[];
  output: string;
  tools: string;
  toolsIntro: string;
  toolItems: Item[];
  assurance: string;
  assuranceItems: Item[];
  faq: string;
  questions: { question: string; answer: string }[];
  contact: string;
  contactBody: string;
  contactAside: string;
  contactPoints: string[];
  diagram: string[];
  diagramLabel: string;
};

export const aiDevelopmentCopy: Record<Locale, AiDevelopmentCopy> = {
  ar: {
    eyebrow: 'هندسة البرمجيات × الذكاء الاصطناعي',
    title: 'من كتابة الكود إلى تطوير أذكى، بمنهج واضح',
    intro:
      'نساعدك على إدخال الذكاء الاصطناعي في دورة تطوير البرمجيات: من فهم المتطلبات إلى الاختبار والإطلاق. نبدأ بمسار عمل محدد، نراجع المخرجات مع فريقك، ونبني أساسًا يمكن قياسه وتطويره.',
    primary: 'ناقش احتياج فريقك',
    secondary: 'اكتشف منهج العمل',
    nav: ['الخدمات', 'التطبيقات', 'منهج العمل', 'الأدوات', 'الأسئلة الشائعة'],
    principles: ['مراجعة بشرية', 'ضوابط للبيانات', 'قياس قبل التوسّع', 'نقل المعرفة'],
    overview: 'قيمة الذكاء الاصطناعي تبدأ من طريقة العمل',
    overviewBody:
      'الأداة وحدها لا تعالج اختناقات التسليم. نربط استخدامها بالمتطلبات ومعايير القبول ومراجعة الكود والاختبارات، ليظل القرار الهندسي واضحًا والمسؤولية محددة في كل مرحلة.',
    challenge: 'التحدّي',
    response: 'كيف نعالجه',
    comparisons: [
      {
        problem: 'تجارب متفرقة بلا منهج مشترك',
        solution: 'اختيار حالات استخدام محددة، وسياسة استخدام ودليل عمل يطبّقه الفريق.',
      },
      {
        problem: 'أدوات لا تنسجم مع العمل اليومي',
        solution: 'تقييم الأدوات على مهام فعلية وربطها بالمستودعات والمراجعات الحالية.',
      },
      {
        problem: 'صعوبة إثبات الأثر',
        solution: 'تسجيل خط أساس ومتابعة زمن إنجاز المهمة وجودة المخرجات وحجم إعادة العمل.',
      },
      {
        problem: 'غموض حول حماية الكود والبيانات',
        solution: 'مراجعة الصلاحيات وإعدادات مشاركة البيانات واعتماد نقاط مراجعة بشرية.',
      },
    ],
    consulting: 'استشارات تمهّد لتبنٍّ عملي',
    consultingIntro: 'ابدأ من واقع فريقك، ثم اختر ما يستحق التجربة والاستثمار.',
    consultingItems: [
      {
        title: 'تقييم جاهزية الفريق',
        body: 'نراجع مسارات التطوير والأدوات والمهارات ونحدّد نقاط البداية ومخاطر التطبيق.',
      },
      {
        title: 'تصميم سير العمل',
        body: 'نحدد أين يساعد الذكاء الاصطناعي، وما الذي يحتاج موافقة بشرية، وكيف توثّق القرارات.',
      },
      {
        title: 'اختيار الأدوات وإعدادها',
        body: 'نقارن الخيارات على متطلباتك الفنية وسياسات البيانات والتكلفة، ثم نضبط بيئة التجربة.',
      },
      {
        title: 'نماذج أولية للوكلاء',
        body: 'نختبر مهام محدودة مثل تحليل التذاكر أو إعداد مسودة اختبار، بصلاحيات ونطاق واضحين.',
      },
      {
        title: 'تدريب وتمكين الفريق',
        body: 'جلسات تطبيقية على صياغة التعليمات والتحقق من الإجابات ومراجعة التغييرات المقترحة.',
      },
      {
        title: 'متابعة وتحسين مستمر',
        body: 'نراجع نتائج التجربة واستخدام الأدوات ونحدّث دليل العمل بناءً على ما ينجح فعليًا.',
      },
    ],
    engineering: 'من الاستشارة إلى مسار التطوير',
    engineeringIntro:
      'ندمج المساعدة الذكية في العمل الهندسي مع الحفاظ على الاختبار والمراجعة والتحكم في الإطلاق.',
    engineeringItems: [
      {
        title: 'اختبارات وضمان جودة',
        body: 'اقتراح حالات اختبار من المتطلبات، وتوسيع تغطية الحالات الحدّية، وتحليل الإخفاقات قبل اعتماد التغييرات.',
      },
      {
        title: 'أتمتة التسليم وDevOps',
        body: 'إعداد مسودات إعدادات وخطوات تشغيل، وتحليل سجلات البناء، وربط المخرجات بفحوصات خطوط CI/CD.',
      },
      {
        title: 'تحديث الأنظمة القائمة',
        body: 'تفسير أجزاء الكود، وتوثيق الاعتماديات، وتجربة إعادة الهيكلة على نطاق صغير مع اختبارات رجوع.',
      },
      {
        title: 'تطوير قائم على المتطلبات',
        body: 'تحويل الحاجة إلى مواصفات ومعايير قبول قابلة للمراجعة، ثم ربط التنفيذ والاختبار بهذه المواصفات.',
      },
    ],
    examples: 'أين يمكن أن يبدأ فريقك؟',
    exampleNote: 'سيناريوهات توضيحية لتحديد نطاق تجربة مناسبة.',
    exampleItems: [
      {
        title: 'مساعد معرفة هندسية',
        body: 'البحث في وثائق المشروع المعتمدة وإظهار مصادر الإجابة، مع احترام صلاحيات الوصول.',
      },
      {
        title: 'مساعد مراجعة التغييرات',
        body: 'تلخيص طلبات الدمج واقتراح نقاط فحص للمراجع، مع بقاء قرار الدمج لدى الفريق.',
      },
      {
        title: 'مساعد لاختبار المتطلبات',
        body: 'اقتراح حالات اختبار مرتبطة بمعايير القبول، ثم مراجعتها وتشغيلها ضمن البيئة القائمة.',
      },
    ],
    approach: 'خطوات واضحة، من التقييم إلى التوسّع',
    approachIntro:
      'نتفق على المدة والنطاق والمقاييس وفق حجم المشروع وحساسية البيانات. الانتقال بين المراحل يعتمد على مراجعة النتائج.',
    output: 'مخرج المرحلة',
    stages: [
      {
        title: 'نقيّم',
        body: 'نفهم دورة التطوير، نختار نقطة بداية ونسجّل الوضع الحالي ومعايير النجاح.',
        output: 'خارطة أولويات وخط أساس للقياس',
      },
      {
        title: 'نجرّب',
        body: 'نعمل مع فريقك على مهمة محددة ونختبر جودة المخرجات والتكامل والضوابط.',
        output: 'تجربة موثّقة وقرار بالاستمرار أو التعديل',
      },
      {
        title: 'نوسّع',
        body: 'ننقل المسارات التي أثبتت فائدتها إلى فرق ومهام إضافية مع تدريب وإرشادات مشتركة.',
        output: 'دليل تشغيل وخطة تبنٍّ تدريجية',
      },
      {
        title: 'نحسّن',
        body: 'نراجع الأثر والتكاليف والمخاطر ونعدّل الأدوات والأتمتة بحسب البيانات المتاحة.',
        output: 'مراجعات دورية وخطة تحسين',
      },
    ],
    tools: 'منظومة أدوات تناسب بيئتك',
    toolsIntro:
      'نحدد الاختيار النهائي خلال التقييم وفق متطلبات التكامل والترخيص ومكان معالجة البيانات، مع تجربة عملية قبل الاعتماد.',
    toolItems: [
      {
        title: 'مساعدات داخل بيئة التطوير',
        body: 'مساعدة سياقية في فهم الكود وصياغة التغييرات والتوثيق ضمن بيئة المطوّر.',
      },
      {
        title: 'وكلاء ومهام محددة',
        body: 'أتمتة مهام محدودة داخل بيئة معزولة، مع ضبط الصلاحيات وسجل للعمليات ونقاط موافقة.',
      },
      {
        title: 'المعرفة والجودة والتكامل',
        body: 'ربط وثائق المشروع والاختبارات وخطوط البناء لتقديم سياق واضح والتحقق من المخرجات.',
      },
    ],
    assurance: 'قدرة تبقى داخل فريقك',
    assuranceItems: [
      {
        title: 'تحكم هندسي',
        body: 'مراجعة تغييرات الكود واختبارها قبل الإطلاق، مع توثيق المسؤوليات وحدود الأتمتة.',
      },
      {
        title: 'حوكمة من البداية',
        body: 'تحديد البيانات المسموح مشاركتها وضبط الوصول والاحتفاظ وفق سياسة مؤسستك.',
      },
      {
        title: 'معرفة قابلة للنقل',
        body: 'دليل عمل وتدريب ووثائق تساعد فريقك على تشغيل المسار وتطويره بعد التسليم.',
      },
    ],
    faq: 'أسئلة شائعة',
    questions: [
      {
        question: 'ما التطوير المعزّز بالذكاء الاصطناعي؟',
        answer:
          'هو استخدام أدوات الذكاء الاصطناعي للمساعدة في مهام التطوير والتوثيق والاختبار ضمن مسار هندسي يراجعه الفريق. يبقى اعتماد المخرجات والإطلاق مسؤولية بشرية.',
      },
      {
        question: 'هل نحتاج إلى تغيير أدواتنا الحالية؟',
        answer:
          'ليس بالضرورة. نبدأ بتقييم المستودعات وبيئة التطوير وخطوط التسليم الحالية، ونختبر إمكانية دمج الأدوات قبل اقتراح تغييرات أوسع.',
      },
      {
        question: 'كيف تتعاملون مع الكود والبيانات الحساسة؟',
        answer:
          'نحدد تصنيف البيانات وسياسة مشاركتها أولًا، ثم نراجع شروط الأداة وإعداداتها وصلاحياتها ومكان المعالجة. لا نرسل بيانات المشروع إلى خدمة خارجية إلا ضمن النطاق المتفق عليه.',
      },
      {
        question: 'كيف نقيس نجاح التجربة؟',
        answer:
          'نتفق على مؤشرات مرتبطة بالمهمة، مثل زمن الإنجاز وجودة الاختبارات وإعادة العمل. نقارن النتائج بخط أساس ونراجعها مع الفريق قبل اتخاذ قرار التوسّع.',
      },
      {
        question: 'كيف نبدأ وما مدة التنفيذ؟',
        answer:
          'نبدأ بمحادثة لفهم الفريق ومسار العمل المستهدف. بعد التقييم نحدد نطاق تجربة ومخرجاتها وجدولها؛ تختلف المدة حسب التكاملات وحساسية البيانات وتوافر الفريق.',
      },
    ],
    contact: 'لنحدّد أول مسار يستحق التجربة',
    contactBody:
      'أخبرنا عن فريقك وأدواتك وأكبر عائق في دورة التطوير، لنناقش نقطة بداية ونطاقًا عمليًا.',
    contactAside: 'ما الذي نحتاج معرفته؟',
    contactPoints: [
      'طبيعة المنتج وتقنيات التطوير',
      'المهمة التي تستهلك وقت الفريق',
      'متطلبات الخصوصية والتكامل',
    ],
    diagram: ['المتطلبات', 'التطوير', 'المراجعة', 'الاختبار', 'الإطلاق'],
    diagramLabel: 'مسار تطوير يربط المتطلبات بالمساعدة الذكية والمراجعة والاختبار والإطلاق',
  },
  en: {
    eyebrow: 'SOFTWARE ENGINEERING × AI',
    title: 'Build smarter software. Keep engineering in control.',
    intro:
      'Bring AI into the work between requirements and release. We help your team test focused workflows, review the outputs and establish a measurable foundation for adoption.',
    primary: 'Discuss your team’s needs',
    secondary: 'Explore our approach',
    nav: ['Services', 'Applications', 'Approach', 'Tools', 'FAQ'],
    principles: ['Human review', 'Data controls', 'Measure before scaling', 'Knowledge transfer'],
    overview: 'Better delivery starts with a better workflow',
    overviewBody:
      'A new tool cannot resolve every delivery bottleneck. We connect AI assistance to requirements, acceptance criteria, code review and testing so engineering decisions remain explicit and accountable.',
    challenge: 'The challenge',
    response: 'Our response',
    comparisons: [
      {
        problem: 'Scattered experiments without shared practices',
        solution: 'Agree on focused use cases, usage policies and a practical team playbook.',
      },
      {
        problem: 'Tools disconnected from everyday delivery',
        solution: 'Evaluate assistance on real tasks within existing repositories and reviews.',
      },
      {
        problem: 'Unclear evidence of value',
        solution: 'Record a baseline and track task completion, output quality and rework.',
      },
      {
        problem: 'Uncertainty around code and data protection',
        solution: 'Review permissions, data-sharing settings and human approval points.',
      },
    ],
    consulting: 'A practical foundation for AI adoption',
    consultingIntro:
      'Understand your team’s starting point before deciding what to test and where to invest.',
    consultingItems: [
      {
        title: 'Team readiness assessment',
        body: 'Review delivery practices, tooling and skills to identify opportunities and adoption risks.',
      },
      {
        title: 'Workflow design',
        body: 'Define where assistance fits, which decisions need approval and how to document the work.',
      },
      {
        title: 'Tool selection and setup',
        body: 'Evaluate options against integration, data policies and cost, then configure a trial environment.',
      },
      {
        title: 'Focused agent prototypes',
        body: 'Test bounded tasks such as ticket analysis or draft tests with explicit permissions and scope.',
      },
      {
        title: 'Training and enablement',
        body: 'Hands-on sessions on giving context, checking responses and reviewing proposed changes.',
      },
      {
        title: 'Ongoing adoption support',
        body: 'Review trial results and tool usage, updating team guidance around practices that work.',
      },
    ],
    engineering: 'AI assistance across the delivery lifecycle',
    engineeringIntro:
      'Connect assistance to engineering tasks while retaining tests, review and release controls.',
    engineeringItems: [
      {
        title: 'Testing and quality assurance',
        body: 'Draft tests from requirements, explore edge cases and investigate failures before accepting changes.',
      },
      {
        title: 'Delivery automation and DevOps',
        body: 'Draft configuration and runbooks, investigate build logs and validate outputs through CI/CD checks.',
      },
      {
        title: 'Existing application modernization',
        body: 'Explain code, map dependencies and trial scoped refactoring protected by regression tests.',
      },
      {
        title: 'Requirements-led engineering',
        body: 'Turn business needs into reviewable specifications and acceptance criteria that guide implementation and testing.',
      },
    ],
    examples: 'Where could your team start?',
    exampleNote: 'Illustrative scenarios to help define a focused pilot.',
    exampleItems: [
      {
        title: 'Engineering knowledge assistant',
        body: 'Search approved project documentation with source references and appropriate access controls.',
      },
      {
        title: 'Change review assistant',
        body: 'Summarize pull requests and suggest review checks while the team retains merge decisions.',
      },
      {
        title: 'Requirements testing assistant',
        body: 'Draft tests linked to acceptance criteria, then review and run them in the existing environment.',
      },
    ],
    approach: 'A clear path from assessment to adoption',
    approachIntro:
      'Scope, timing and measures depend on your project and data requirements. Each stage ends with a review before the next commitment.',
    output: 'Stage outcome',
    stages: [
      {
        title: 'Understand',
        body: 'Review delivery workflows, select a starting point and agree on the baseline and success criteria.',
        output: 'Prioritized roadmap and measurement baseline',
      },
      {
        title: 'Validate',
        body: 'Work alongside your team on a focused task to assess quality, integration and controls.',
        output: 'Documented pilot and a continue-or-adjust decision',
      },
      {
        title: 'Extend',
        body: 'Introduce useful practices to additional tasks and teams with shared guidance and training.',
        output: 'Team playbook and phased adoption plan',
      },
      {
        title: 'Improve',
        body: 'Review impact, costs and risks, adapting tools and automation using the evidence available.',
        output: 'Regular reviews and improvement plan',
      },
    ],
    tools: 'A tool ecosystem that fits your environment',
    toolsIntro:
      'Selection follows an assessment of integration, licensing and data processing requirements, with a practical evaluation before adoption.',
    toolItems: [
      {
        title: 'Development environment assistants',
        body: 'Contextual support for understanding code, drafting changes and documenting work inside the developer environment.',
      },
      {
        title: 'Agents for bounded tasks',
        body: 'Scoped automation in isolated environments with permissions, activity records and approval points.',
      },
      {
        title: 'Knowledge, quality and integration',
        body: 'Connect project documentation, tests and build pipelines to provide context and validate outputs.',
      },
    ],
    assurance: 'Build capability your team can own',
    assuranceItems: [
      {
        title: 'Engineering control',
        body: 'Review and test changes before release, with documented responsibilities and automation boundaries.',
      },
      {
        title: 'Governance from the start',
        body: 'Define which data can be shared and configure access and retention around your organization’s policies.',
      },
      {
        title: 'Transferable knowledge',
        body: 'Practical guidance, training and documentation to help the team operate and improve the workflow after handover.',
      },
    ],
    faq: 'Frequently asked questions',
    questions: [
      {
        question: 'What is AI-augmented development?',
        answer:
          'AI tools assist with engineering, documentation and testing inside a team-reviewed delivery process. People remain responsible for accepting outputs and authorizing releases.',
      },
      {
        question: 'Will we need to replace our existing tools?',
        answer:
          'Not necessarily. We assess your repositories, development environment and pipelines first, then evaluate integrations before proposing broader changes.',
      },
      {
        question: 'How is sensitive code and data handled?',
        answer:
          'We define data classification and sharing policies, then review tool terms, settings, permissions and processing locations. External sharing stays within the agreed project scope.',
      },
      {
        question: 'How do we evaluate the pilot?',
        answer:
          'Agree on task-specific measures such as completion time, test quality and rework. Compare against a baseline and review the findings with the team before scaling.',
      },
      {
        question: 'How do we start, and how long does it take?',
        answer:
          'Start with a discussion of your team and target workflow. Assessment defines the pilot, outputs and schedule; timing depends on integrations, data requirements and team availability.',
      },
    ],
    contact: 'Find the right first workflow',
    contactBody:
      'Tell us about your team, tooling and delivery bottleneck. We can discuss a practical starting point and scope.',
    contactAside: 'What helps us understand your needs?',
    contactPoints: [
      'Product context and development stack',
      'A task that consumes engineering time',
      'Privacy and integration requirements',
    ],
    diagram: ['Requirements', 'Develop', 'Review', 'Test', 'Release'],
    diagramLabel:
      'A development workflow connecting requirements, AI assistance, human review, testing and release',
  },
  tr: {
    eyebrow: 'YAZILIM MÜHENDİSLİĞİ × YAPAY ZEKÂ',
    title: 'Daha akıllı geliştirme. Kontrol ekibinizde.',
    intro:
      'Yapay zekâyı gereksinimlerden yayına uzanan geliştirme sürecine dahil edin. Ekibinizle sınırlı iş akışlarını dener, çıktıları inceler ve ölçülebilir bir benimseme zemini oluştururuz.',
    primary: 'Ekibinizin ihtiyacını görüşelim',
    secondary: 'Yaklaşımımızı keşfedin',
    nav: ['Hizmetler', 'Uygulamalar', 'Yaklaşım', 'Araçlar', 'SSS'],
    principles: ['İnsan incelemesi', 'Veri kontrolleri', 'Önce ölçüm', 'Bilgi aktarımı'],
    overview: 'Değer, çalışma biçiminizle başlar',
    overviewBody:
      'Yeni bir araç tek başına teslimat sorunlarını çözmez. Yapay zekâ desteğini gereksinimler, kabul kriterleri, kod incelemesi ve testlerle birleştirerek mühendislik kararlarını ve sorumlulukları açık tutarız.',
    challenge: 'Zorluk',
    response: 'Yaklaşımımız',
    comparisons: [
      {
        problem: 'Ortak yöntem olmadan dağınık denemeler',
        solution: 'Odaklı kullanım senaryoları, kullanım politikası ve ekip rehberi belirlemek.',
      },
      {
        problem: 'Günlük işten kopuk araçlar',
        solution:
          'Araçları mevcut depolar ve incelemeler içindeki gerçek görevlerde değerlendirmek.',
      },
      {
        problem: 'Değerin ölçülememesi',
        solution: 'Başlangıç ölçümü alıp görev süresini, kaliteyi ve yeniden çalışmayı izlemek.',
      },
      {
        problem: 'Kod ve veri güvenliğinde belirsizlik',
        solution: 'İzinleri, veri paylaşım ayarlarını ve insan onayı noktalarını incelemek.',
      },
    ],
    consulting: 'Uygulanabilir bir başlangıç için danışmanlık',
    consultingIntro: 'Deneme ve yatırım kararlarından önce ekibinizin mevcut durumunu anlayın.',
    consultingItems: [
      {
        title: 'Ekip hazırlık değerlendirmesi',
        body: 'İş akışlarını, araçları ve yetkinlikleri inceleyerek fırsatları ve riskleri belirleriz.',
      },
      {
        title: 'İş akışı tasarımı',
        body: 'Desteğin nerede kullanılacağını, onay noktalarını ve kararların nasıl kaydedileceğini tanımlarız.',
      },
      {
        title: 'Araç seçimi ve kurulum',
        body: 'Entegrasyon, veri politikası ve maliyeti değerlendirerek deneme ortamını hazırlarız.',
      },
      {
        title: 'Sınırlı ajan prototipleri',
        body: 'Talep analizi veya test taslağı gibi belirli görevleri açık izinlerle deneriz.',
      },
      {
        title: 'Eğitim ve yetkinlik geliştirme',
        body: 'Bağlam sağlama, yanıtları doğrulama ve değişiklikleri inceleme üzerine uygulamalı çalışmalar.',
      },
      {
        title: 'Sürekli benimseme desteği',
        body: 'Deneme sonuçlarını ve kullanımı inceleyerek ekip rehberini güncelleriz.',
      },
    ],
    engineering: 'Geliştirme döngüsü boyunca destek',
    engineeringIntro: 'Yapay zekâ desteğini test, inceleme ve yayın kontrolleriyle birleştirin.',
    engineeringItems: [
      {
        title: 'Test ve kalite güvencesi',
        body: 'Gereksinimlerden test taslakları üretmek, uç durumları araştırmak ve hataları incelemek.',
      },
      {
        title: 'Teslimat otomasyonu ve DevOps',
        body: 'Yapılandırma taslakları ve işletim rehberleri hazırlamak, günlükleri analiz edip CI/CD kontrolleriyle doğrulamak.',
      },
      {
        title: 'Mevcut uygulamaların modernizasyonu',
        body: 'Kodu açıklamak, bağımlılıkları belgelemek ve regresyon testleriyle sınırlı yeniden yapılandırmalar denemek.',
      },
      {
        title: 'Gereksinim odaklı mühendislik',
        body: 'İhtiyaçları, uygulama ve testlere yön veren incelenebilir şartnamelere ve kabul kriterlerine dönüştürmek.',
      },
    ],
    examples: 'Ekibiniz nereden başlayabilir?',
    exampleNote: 'Odaklı bir pilot belirlemek için örnek senaryolar.',
    exampleItems: [
      {
        title: 'Mühendislik bilgi asistanı',
        body: 'Onaylı proje belgelerinde kaynak göstererek ve erişim izinlerine uyarak arama.',
      },
      {
        title: 'Değişiklik inceleme asistanı',
        body: 'Birleştirme kararı ekipte kalırken değişiklikleri özetlemek ve inceleme noktaları önermek.',
      },
      {
        title: 'Gereksinim testi asistanı',
        body: 'Kabul kriterlerine bağlı testler hazırlayıp mevcut ortamda incelemek ve çalıştırmak.',
      },
    ],
    approach: 'Değerlendirmeden yaygınlaştırmaya açık adımlar',
    approachIntro:
      'Kapsam, süre ve ölçümler projenize ve veri gereksinimlerinize göre belirlenir. Her aşama sonuçların incelenmesiyle tamamlanır.',
    output: 'Aşama çıktısı',
    stages: [
      {
        title: 'Anla',
        body: 'İş akışını inceleyip başlangıç noktasını ve başarı kriterlerini belirleriz.',
        output: 'Öncelikli yol haritası ve başlangıç ölçümü',
      },
      {
        title: 'Doğrula',
        body: 'Ekibinizle belirli bir görev üzerinde kalite, entegrasyon ve kontrolleri deneriz.',
        output: 'Belgelenmiş pilot ve devam kararı',
      },
      {
        title: 'Yaygınlaştır',
        body: 'Faydalı yöntemleri rehber ve eğitimle diğer görevlere ve ekiplere taşırız.',
        output: 'Ekip rehberi ve aşamalı benimseme planı',
      },
      {
        title: 'İyileştir',
        body: 'Etkiyi, maliyeti ve riskleri inceleyip araçları mevcut verilere göre uyarlarız.',
        output: 'Düzenli değerlendirme ve iyileştirme planı',
      },
    ],
    tools: 'Ortamınıza uygun bir araç ekosistemi',
    toolsIntro:
      'Seçim; entegrasyon, lisanslama ve veri işleme gereksinimleri değerlendirilip pratik bir deneme yapıldıktan sonra kesinleşir.',
    toolItems: [
      {
        title: 'Geliştirme ortamı asistanları',
        body: 'Geliştirici ortamında kodu anlama, değişiklik taslağı hazırlama ve belgeleme desteği.',
      },
      {
        title: 'Sınırlı görevler için ajanlar',
        body: 'İzinler, işlem kayıtları ve onay noktalarıyla izole ortamlarda kontrollü otomasyon.',
      },
      {
        title: 'Bilgi, kalite ve entegrasyon',
        body: 'Bağlam sağlamak ve çıktıları doğrulamak için proje belgelerini, testleri ve derleme hatlarını bağlamak.',
      },
    ],
    assurance: 'Ekibinizde kalan bir yetkinlik',
    assuranceItems: [
      {
        title: 'Mühendislik kontrolü',
        body: 'Yayından önce inceleme ve test; belgelenmiş sorumluluklar ve otomasyon sınırları.',
      },
      {
        title: 'Başlangıçtan itibaren yönetişim',
        body: 'Paylaşılabilir verileri belirleyip erişim ve saklama ayarlarını kurum politikasına göre düzenlemek.',
      },
      {
        title: 'Aktarılabilir bilgi',
        body: 'Teslimden sonra iş akışını işletmek ve geliştirmek için eğitim, rehber ve belgeler.',
      },
    ],
    faq: 'Sık sorulan sorular',
    questions: [
      {
        question: 'Yapay zekâ destekli geliştirme nedir?',
        answer:
          'Yapay zekâ araçlarının geliştirme, belgeleme ve test görevlerinde ekip incelemesi altında kullanılmasıdır. Çıktıları kabul etme ve yayınlama sorumluluğu insanlarda kalır.',
      },
      {
        question: 'Mevcut araçlarımız değişecek mi?',
        answer:
          'Her zaman değil. Önce depoları, geliştirme ortamını ve teslimat hatlarını değerlendirir, daha geniş değişikliklerden önce entegrasyonları deneriz.',
      },
      {
        question: 'Hassas kod ve veriler nasıl ele alınır?',
        answer:
          'Veri sınıflandırmasını ve paylaşım politikasını belirler, araç koşullarını, izinleri ve işleme konumlarını inceleriz. Dış paylaşım, kararlaştırılan kapsam içinde kalır.',
      },
      {
        question: 'Pilot nasıl ölçülür?',
        answer:
          'Görev süresi, test kalitesi ve yeniden çalışma gibi ölçütler belirlenir. Sonuçlar başlangıç ölçümüyle karşılaştırılarak yaygınlaştırmadan önce ekiple incelenir.',
      },
      {
        question: 'Nasıl başlanır ve ne kadar sürer?',
        answer:
          'Ekibinizi ve hedef iş akışını görüşerek başlarız. Değerlendirme sonrasında pilot kapsamı, çıktıları ve takvimi belirlenir; süre entegrasyonlara ve veri gereksinimlerine bağlıdır.',
      },
    ],
    contact: 'İlk iş akışını birlikte belirleyelim',
    contactBody:
      'Ekibinizi, araçlarınızı ve teslimat darboğazınızı anlatın; uygulanabilir bir başlangıç ve kapsam görüşelim.',
    contactAside: 'Neleri bilmemiz faydalı olur?',
    contactPoints: [
      'Ürün bağlamı ve geliştirme teknolojileri',
      'Ekibin zamanını alan bir görev',
      'Gizlilik ve entegrasyon gereksinimleri',
    ],
    diagram: ['Gereksinim', 'Geliştirme', 'İnceleme', 'Test', 'Yayın'],
    diagramLabel:
      'Gereksinimler, yapay zekâ desteği, insan incelemesi, test ve yayını birleştiren geliştirme akışı',
  },
};
