# الصور المصغرة لقائمة الخدمات

## العرض

أضيف رسمان أصليان بألوان زاهية للقائمة المنسدلة على الكمبيوتر بالعربية والإنجليزية:

- هندسة المنتجات البرمجية: صورة داخل الخانة الأخيرة الفارغة من شبكة الخدمات، تقود إلى صفحة هندسة المنتجات.
- المنصات الذكية والأتمتة: بطاقة أفقية أسفل الروابط، تقود إلى صفحة الأتمتة والربط.

يبقى ترتيب روابط الخدمات كما هو. تظهر البطاقة فقط عندما يكون رابط خدمتها موجودًا في الفئة النشطة، فلا تعيد خدمة محذوفة. الفئات الأخرى والقائمة التركية وقائمة الجوال تحتفظ بمحتواها الحالي.

## الملفات والأداء

- `apps/web/public/brand/navigation/engineering-v1.webp`: نحو 26 كيلوبايت.
- `apps/web/public/brand/navigation/automation-v1.webp`: نحو 26 كيلوبايت.
- الأبعاد: 560 × 373 بكسل لكل صورة.
- تحميل كسول ومباشر من ملفات الموقع، دون معالجة صور وقت الطلب. الأبعاد محددة لتجنب تغير التخطيط.
- النص خارج الصورة لضمان وضوحه؛ الصورة زخرفية داخل رابط له وصف واضح. أثر تكبير خفيف للمرور والتركيز مع تعطيله عند طلب تقليل الحركة.

## التوليد

استُخدمت أداة توليد الصور المدمجة `image_gen` بوضع الإنشاء، دون صور مرجعية أو تحرير للشعار. حُفظ الأصل في مجلد الصور المولدة الخاص بالأداة، وأضيفت النسختان المحسنتان للمستودع. التحسين اقتصر على التصغير والتحويل إلى WebP.

### Prompt: engineering

Use case: stylized-concept. Create one landscape 3:2 polished 3D editorial illustration for a small service navigation thumbnail on a premium technology company website. Subject: a playful but sophisticated floating cobalt laptop with a luminous orange code-bracket symbol on its screen, fuchsia interface tiles, one cyan translucent glass cube and a yellow small component arranged around it. Saturated electric violet and cobalt backdrop, crisp cyan rim light, rich tangerine and lemon accents. Bold clear silhouette and simple composition readable at 260px wide. Premium clay and glossy acrylic materials, studio lighting, large rounded objects, subtle shadows. No text, letters, digits, logos, watermarks, human figures, website layout or borders. Fill the frame with the illustration; keep main objects fully within central 85%. A distinct vivid colorful software engineering image, not a screenshot.

### Prompt: automation

Use case: stylized-concept. Create one landscape 3:2 polished 3D editorial illustration for a small service navigation thumbnail on a premium technology company website. Subject: three large rounded modules in an elegant automated workflow, an orange cube with a simple white checkmark, a translucent cyan module with a gear shape, and a magenta module with three connected rounded nodes. Connected by bold luminous yellow curved tubes. Saturated cobalt/electric-blue backdrop with emerald and cyan glow, tangerine and hot pink accents. Premium clay and glossy acrylic materials, crisp studio lighting, strong silhouettes and few large objects readable at 260px wide. No words, letters, digits, logos, watermarks, human figures, website UI or borders. Fill the frame, all important objects in central 85%. Distinct vivid business automation illustration with tangible depth.

## التحقق والرجوع

بناء الموقع وفحص الأنواع وESLint وPrettier؛ وفحوص متصفح للصور والروابط والتنقل بلوحة المفاتيح وإغلاق القائمة والإتاحة والمقاسات واتجاه العربية وتقليل الحركة والحفاظ على التركية والجوال والخدمات المحذوفة. تُراجع معاينة القائمتين قبل التسليم.

نقطة الرجوع: `checkpoint/pre-navigation-visuals-20261028` عند `9896701`. النشر على Render يدوي بعد رفع التحديث إلى المستودع المعتمد على `main`.
