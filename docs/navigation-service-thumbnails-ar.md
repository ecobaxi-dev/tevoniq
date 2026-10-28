# الصور والشعارات في قوائم التنقل

## العرض

أصبحت فئات الخدمات السبع مصوّرة بالعربية والإنجليزية: الاستشارات والتنفيذ، هندسة المنتجات، المنصات الذكية والأتمتة، الأنظمة المدمجة، الذكاء الاصطناعي، الأمن والجودة، والخدمات الإضافية. أضيفت صورة مستقلة إلى قائمة حلولنا، وشعارا بيستو والمحامون الأصليان إلى قائمة المنتجات على الكمبيوتر والجوال.

تظهر صورة الخدمة فقط إن كان رابطها موجودًا في الفئة النشطة. يُستخدم تخطيط أفقي للفئات ذات العدد الزوجي أو الخدمة الوحيدة، وخانة داخل الشبكة للأعداد الفردية، مع إظهار الرابط الوحيد بعرض الصف. لم تتغير قوائم الخدمات وروابطها أو تتعدّل التركية.

## الملفات والأداء

| المسار                                                | الحجم بالبايت |
| ----------------------------------------------------- | ------------: |
| apps/web/public/brand/navigation/engineering-v1.webp  |         25922 |
| apps/web/public/brand/navigation/automation-v1.webp   |         25828 |
| apps/web/public/brand/navigation/consulting-v1.webp   |         30860 |
| apps/web/public/brand/navigation/iot-v1.webp          |         38450 |
| apps/web/public/brand/navigation/security-v1.webp     |         23102 |
| apps/web/public/brand/navigation/additional-v1.webp   |         23014 |
| apps/web/public/brand/navigation/solutions-v1.webp    |         27126 |
| apps/web/public/brand/navigation/ai-v1.webp           |         40190 |
| apps/web/public/brand/navigation/pesto-logo-v1.webp   |          9142 |
| apps/web/public/brand/navigation/advocas-logo-v1.webp |         20136 |

الحجم الكلي للصور الثماني والشعارين: 263770 بايت. كل رسم بعرض 560 بكسل، وكل شعار بعرض 320 بكسل مع الحفاظ على نسبته. تُحمّل الملفات مباشرة بصيغة WebP تحميلًا كسولًا، دون معالجة وقت الطلب. لا تُطلب صور جميع الفئات عند الدخول؛ صورة الفئة مرتبطة بالاختيار الظاهر.

النص خارج الرسومات، والروابط ذات أسماء واضحة، والصور الزخرفية دون تكرار للأسماء. تأثير المرور يحترم تقليل الحركة. تُحصر القوائم الطويلة داخل ارتفاع النافذة وتقبل التمرير.

## الشعارات

شعارا المنتجات نسختان مصغرتان من ملفات المالك الأصلية: apps/web/public/brand/pesto-logo.png وapps/web/public/brand/advocas-logo.png. لم يُعاد توليدهما أو استبدالهما برسم. احتُفظ بالأصل والألوان والشفافية والنسب.

## التوليد

استُخدمت أداة image_gen المدمجة بوضع الإنشاء للرسومات فقط، مع حفظ الأصول في مجلد الأداة. اقتصرت المعالجة المحلية على التصغير والتحويل إلى WebP؛ الأسماء المنتهية بـ v1 مستقلة ولا تستبدل ملفات العلامة الأصلية.

### Prompt: engineering

Use case: stylized-concept. Create one landscape 3:2 polished 3D editorial illustration for a small service navigation thumbnail on a premium technology company website. Subject: a playful but sophisticated floating cobalt laptop with a luminous orange code-bracket symbol on its screen, fuchsia interface tiles, one cyan translucent glass cube and a yellow small component arranged around it. Saturated electric violet and cobalt backdrop, crisp cyan rim light, rich tangerine and lemon accents. Bold clear silhouette and simple composition readable at 260px wide. Premium clay and glossy acrylic materials, studio lighting, large rounded objects, subtle shadows. No text, letters, digits, logos, watermarks, human figures, website layout or borders. Fill the frame with the illustration; keep main objects fully within central 85%. A distinct vivid colorful software engineering image, not a screenshot.

### Prompt: automation

Use case: stylized-concept. Create one landscape 3:2 polished 3D editorial illustration for a small service navigation thumbnail on a premium technology company website. Subject: three large rounded modules in an elegant automated workflow, an orange cube with a simple white checkmark, a translucent cyan module with a gear shape, and a magenta module with three connected rounded nodes. Connected by bold luminous yellow curved tubes. Saturated cobalt/electric-blue backdrop with emerald and cyan glow, tangerine and hot pink accents. Premium clay and glossy acrylic materials, crisp studio lighting, strong silhouettes and few large objects readable at 260px wide. No words, letters, digits, logos, watermarks, human figures, website UI or borders. Fill the frame, all important objects in central 85%. Distinct vivid business automation illustration with tangible depth.

### Prompt: consulting

Use case: stylized-concept. Create one landscape 3:2 premium 3D editorial illustration for a compact navigation thumbnail on a technology company website. Subject: A bright orange compass on a violet planning board, three cyan and magenta roadmap tiles joined by a yellow path, one clear checkmark. Communicate technology consulting and a practical implementation plan. Match a cohesive vivid collection: saturated electric cobalt and violet background, glossy acrylic and soft clay surfaces, crisp cyan rim lighting, luminous hot pink, tangerine orange and lemon yellow accents. A few large rounded objects, uncluttered silhouette readable at 260px width, rich color and studio shadows, all meaningful objects inside central 85% of frame. No words, letters, numerals, brands, logos, watermarks, human figures or website layout. Fill frame with the illustration.

### Prompt: iot

Use case: stylized-concept. Create one landscape 3:2 premium 3D editorial illustration for a compact navigation thumbnail on a technology company website. Subject: A large glossy cyan microchip with orange pins on a deep violet circuit platform, connected to two small magenta and yellow sensor modules, clean luminous wireless arcs. Communicate embedded systems and connected devices. Match a cohesive vivid collection: saturated electric cobalt and violet background, glossy acrylic and soft clay surfaces, crisp cyan rim lighting, luminous hot pink, tangerine orange and lemon yellow accents. A few large rounded objects, uncluttered silhouette readable at 260px width, rich color and studio shadows, all meaningful objects inside central 85% of frame. No words, letters, numerals, brands, logos, watermarks, human figures or website layout. Fill frame with the illustration.

### Prompt: security

Use case: stylized-concept. Create one landscape 3:2 premium 3D editorial illustration for a compact navigation thumbnail on a technology company website. Subject: A large glossy cyan shield carrying a simple white checkmark, an orange padlock and a magenta validation tile, connected by one yellow curve. Communicate software security and quality checks, with no badges or certification marks. Match a cohesive vivid collection: saturated electric cobalt and violet background, glossy acrylic and soft clay surfaces, crisp cyan rim lighting, luminous hot pink, tangerine orange and lemon yellow accents. A few large rounded objects, uncluttered silhouette readable at 260px width, rich color and studio shadows, all meaningful objects inside central 85% of frame. No words, letters, numerals, brands, logos, watermarks, human figures or website layout. Fill frame with the illustration.

### Prompt: additional

Use case: stylized-concept. Create one landscape 3:2 premium 3D editorial illustration for a compact navigation thumbnail on a technology company website. Subject: A glossy orange plug connecting a cyan system cube to a magenta network module, with a small yellow wrench and gear. Communicate practical integrations, networking and technical support. Match a cohesive vivid collection: saturated electric cobalt and violet background, glossy acrylic and soft clay surfaces, crisp cyan rim lighting, luminous hot pink, tangerine orange and lemon yellow accents. A few large rounded objects, uncluttered silhouette readable at 260px width, rich color and studio shadows, all meaningful objects inside central 85% of frame. No words, letters, numerals, brands, logos, watermarks, human figures or website layout. Fill frame with the illustration.

### Prompt: solutions

Use case: stylized-concept. Create one landscape 3:2 premium 3D editorial illustration for a compact navigation thumbnail on a technology company website. Subject: Three floating glossy application panels: a cyan business website panel, an orange workflow board with simple blocks, a magenta dashboard with abstract bars, connected over a violet platform. Communicate coordinated digital business solutions. Match a cohesive vivid collection: saturated electric cobalt and violet background, glossy acrylic and soft clay surfaces, crisp cyan rim lighting, luminous hot pink, tangerine orange and lemon yellow accents. A few large rounded objects, uncluttered silhouette readable at 260px width, rich color and studio shadows, all meaningful objects inside central 85% of frame. No words, letters, numerals, brands, logos, watermarks, human figures or website layout. Fill frame with the illustration.

### Prompt: ai

Use case: stylized-concept. Create one landscape 3:2 premium 3D editorial illustration for a compact navigation thumbnail on a technology company website. Subject: A large translucent cyan neural-network brain with bright magenta and orange nodes, a small yellow sparkle and a violet processing cube connected beneath it. Communicate artificial intelligence assistance and useful software tools. Match a cohesive vivid collection: saturated electric cobalt and violet background, glossy acrylic and soft clay surfaces, crisp cyan rim lighting, luminous hot pink, tangerine orange and lemon yellow accents. A few large rounded objects, uncluttered silhouette readable at 260px width, rich color and studio shadows, all meaningful objects inside central 85% of frame. No words, letters, numerals, brands, logos, watermarks, human figures or website layout. Fill frame with the illustration.

## التحقق والرجوع

بناء Next.js وفحوص الأنواع وESLint وPrettier؛ وفحوص متصفح للصور السبع وروابطها، وصورة الحلول، وشعاري المنتجات على الكمبيوتر والجوال، والتنقل بلوحة المفاتيح والإغلاق والإتاحة والمقاسات واتجاه العربية وتقليل الحركة، والحفاظ على التركية والخدمات المحذوفة.

نقطة الرجوع الحالية: checkpoint/pre-navigation-complete-20261028 عند be35758. نقطة المرحلة الأولى محفوظة أيضًا باسم checkpoint/pre-navigation-visuals-20261028. النشر على Render يدوي بعد الرفع إلى المستودع المعتمد على main.
