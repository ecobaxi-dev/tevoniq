import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { facebookPosts } from './lib/facebook-posts.mjs';
const root = new URL('../', import.meta.url);
const output = new URL('../docs/marketing/facebook-kit/', import.meta.url);
await mkdir(output, { recursive: true });
const font = (
  await readFile(
    new URL('node_modules/@fontsource-variable/cairo/files/cairo-arabic-wght-normal.woff2', root),
  )
).toString('base64');
const latin = (
  await readFile(
    new URL('node_modules/@fontsource-variable/cairo/files/cairo-latin-wght-normal.woff2', root),
  )
).toString('base64');
const logo = (await readFile(new URL('apps/web/public/brand/logo.png', root))).toString('base64');
const safe = (t) =>
  t.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const icons = {
  browser:
    '<rect x="3" y="4" width="26" height="24" rx="3"/><path d="M3 11h26M8 7.5h.1M12 7.5h.1M9 17h14M9 22h9"/>',
  check: '<circle cx="16" cy="16" r="12"/><path d="m10 16 4 4 8-9"/>',
  layers: '<path d="m3 11 13-7 13 7-13 7zM3 17l13 7 13-7M3 23l13 7 13-7"/>',
  chart: '<path d="M5 4v24h24M11 23v-8M18 23V9M25 23V4"/>',
  file: '<path d="M8 3h12l6 6v20H8zM20 3v7h6M12 16h10M12 21h10"/>',
  arrow: '<path d="M25 16H7m9-9-9 9 9 9"/>',
};
const icon = (n) =>
  `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[n] || icons.check}</svg>`;
const rows = (items) =>
  items
    .map(
      ([a, b], i) =>
        `<div class="file-row"><i>${icon(['file', 'layers', 'check'][i % 3])}</i><div><b>${a}</b><small>${b}</small></div><em>0${i + 1}</em></div>`,
    )
    .join('');
function art(p) {
  if (p.layout === 'website')
    return `<div class="paper tilt"><div class="sheet-top"><b dir="ltr">YOUR BUSINESS</b><span>موقع أعمال</span></div><div class="web-title">خدماتك أقرب إلى عملائك.</div><div class="web-lines"><i></i><i></i></div><div class="web-cards"><div>${icon('browser')}خدمات واضحة</div><div>${icon('file')}معلومات مفيدة</div><div>${icon('arrow')}تواصل مباشر</div></div><div class="fake-button">اطلب الخدمة ${icon('arrow')}</div></div>`;
  if (p.layout === 'requests')
    return `<div class="stack"><div class="mini-note">من الاستقبال إلى الإغلاق</div><div class="request-row"><span class="pill">جديد</span><div><b>استقبال الطلب</b><small>المعلومات المطلوبة في مكان واحد</small></div>${icon('file')}</div><div class="request-row"><span class="pill">متابعة</span><div><b>مسؤول وحالة واضحة</b><small>اعرف أين وصل الطلب</small></div>${icon('layers')}</div><div class="request-row"><span class="pill">مكتمل</span><div><b>ملاحظات يمكن الرجوع إليها</b><small>إغلاق موثّق ضمن مسار العمل</small></div>${icon('check')}</div></div>`;
  if (p.layout === 'automation')
    return `<div class="automation-diagram"><div class="node one">${icon('file')}<b>استقبال المعلومة</b><span>نموذج أو أداة عمل</span></div><div class="connector">↓</div><div class="node two">${icon('layers')}<b>فحص وتنظيم</b><span>وفق قواعد متفق عليها</span></div><div class="connector">↓</div><div class="node three">${icon('check')}<b>تجهيز المتابعة</b><span>مع مراجعة بشرية عند الحاجة</span></div></div>`;
  if (p.layout === 'dashboard')
    return `<div class="dashboard paper"><div class="sheet-top"><b>صورة نشاطك</b><span>تصوّر توضيحي</span></div><div class="metric-grid"><div><small>الطلبات</small><b>ما الذي ينتظر؟</b></div><div><small>المواعيد</small><b>ما الخطوة القادمة؟</b></div></div><div class="chart">${[38, 57, 45, 79, 62, 92, 73].map((h) => `<div style="height:${h}%"></div>`).join('')}</div><div class="chart-key"><i></i> مؤشرات حسب احتياجك <span>رسم توضيحي، وليس نتائج فعلية</span></div></div>`;
  if (p.layout === 'scope')
    return `<div class="paper contract"><div class="sheet-top"><b>ملف مشروعك</b><span>قبل التنفيذ</span></div>${rows(
      [
        ['المخرجات', 'ما الذي ستحصل عليه؟'],
        ['الحدود', 'ما الذي يدخل في المرحلة؟'],
        ['معايير القبول', 'كيف نراجع النتيجة؟'],
      ],
    )}<div class="file-foot">${icon('check')}نطاق مكتوب. وخطوة يمكن مراجعتها.</div></div><div class="seal">وضوح<br>من البداية</div>`;
  return `<div class="phases">${[
    ['نفهم', 'مشكلة وأولوية واضحة'],
    ['نحدّد', 'نطاق ومخرجات متفق عليها'],
    ['نجرّب', 'نسخة قابلة للمراجعة'],
    ['نسلّم', 'توثيق وخطوة تالية واضحة'],
  ]
    .map(
      ([a, b], i) =>
        `<div><span>0${i + 1}</span><section><b>${a}</b><small>${b}</small></section>${icon(i === 3 ? 'check' : 'layers')}</div>`,
    )
    .join('')}</div>`;
}
const style = `@font-face{font-family:Cairo;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:200 1000}@font-face{font-family:Cairo;src:url(data:font/woff2;base64,${latin}) format('woff2');font-weight:200 1000;unicode-range:U+0000-00FF}*{box-sizing:border-box}body{margin:0;background:#e5e8e2;color:#17333b;font-family:Cairo,Tahoma,sans-serif}a{color:#215958}.gallery-head{max-width:1300px;margin:40px auto;padding:0 24px}.gallery-head h1{font-size:28px}.gallery-head p{line-height:1.9}.gallery{display:grid;grid-template-columns:repeat(3,360px);gap:32px;justify-content:center;padding:20px 24px 70px}.item{width:360px}.frame{width:360px;height:450px;border-radius:8px;overflow:hidden;box-shadow:0 10px 40px #17333b14}.poster{width:1080px;height:1350px;padding:62px 72px;background:radial-gradient(ellipse at 8% 25%,#e9e6d4,transparent 52%),#faf8f1;position:relative;overflow:hidden;transform:scale(.3333333333);transform-origin:top right;isolation:isolate;display:flex;flex-direction:column}.top{display:flex;justify-content:space-between;align-items:center;height:70px;flex-shrink:0}.brand{position:relative;width:290px;height:60px;overflow:hidden}.brand img{position:absolute;width:290px;height:290px;top:-122px;left:0}.series{display:flex;align-items:center;gap:15px;font-size:22px;color:#51666a}.series em{font-style:normal;font-size:19px;direction:ltr}.dot{width:10px;height:10px;background:#a34524;border-radius:50%;box-shadow:0 0 0 7px #a3452412}.kicker{font-size:23px;color:#a34524;margin:42px 0 12px;display:flex;align-items:center;gap:13px}.poster h1{font-size:65px;line-height:1.55;letter-spacing:0;margin:0;font-weight:800}.poster h1 span{display:block;color:#a34524}.intro{font-size:29px;line-height:1.95;color:#51666a;margin:22px 0 25px;max-width:870px}.art{position:relative;flex:1;min-height:0;display:flex;align-items:center;padding:12px 12px 25px}.paper{background:#fffef8;border:1px solid #c7d2c6;padding:34px;width:100%;position:relative;box-shadow:0 18px 40px #223f2812;border-radius:5px}.paper:before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#1e5d57 70%,#d4ab7a 70%)}.tilt:after,.contract:after{content:'';position:absolute;inset:-4px -14px -16px 6px;background:#dce4d8;transform:rotate(-3deg);border:1px solid #b9c9b7;z-index:-1;border-radius:5px}.sheet-top{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #d8ded6;padding-bottom:22px;margin-bottom:22px;font-size:25px;color:#274c43}.sheet-top span{font-size:19px;color:#51666a}.sheet-top b[dir=ltr]{font:700 20px monospace;letter-spacing:.15em}.web-title{font-size:40px;font-weight:700}.web-lines{margin:15px 0 22px;display:grid;gap:8px}.web-lines i{display:block;width:65%;height:6px;background:#d6dfd3}.web-lines i:nth-child(2){width:48%}.web-cards{display:flex;gap:16px}.web-cards>div{flex:1;background:#edf1e8;padding:20px 8px;display:grid;justify-items:center;gap:14px;font-size:23px}.poster svg{width:34px;height:34px;flex-shrink:0}.web-cards svg{color:#2c655b;width:40px;height:40px}.fake-button{display:flex;gap:22px;align-items:center;background:#a34524;color:#fff;font-size:23px;padding:12px 22px;border-radius:4px 14px 4px 14px;width:max-content;margin-top:24px}.bottom{border-top:1px solid #c9d2c8;padding-top:25px;display:flex;justify-content:space-between;align-items:center;gap:15px;flex-shrink:0;margin-top:22px}.bottom strong{font-size:25px;display:flex;gap:16px;align-items:center}.bottom b{font:600 24px Arial;letter-spacing:1px;direction:ltr}.bottom svg{width:29px;height:29px;color:#a34524}.micro{position:absolute;bottom:19px;right:72px;left:72px;font-size:13px;letter-spacing:3px;direction:ltr;color:#7c8d7c;text-align:left}.dark{background:radial-gradient(ellipse at 10% 75%,#37685255,transparent 70%),#173b36;color:#fffef3}.dark .brand{background:#faf8f1;border-radius:3px}.dark h1 span{color:#e5b98c}.dark .kicker{color:#e5b98c}.dark .intro,.dark .series{color:#ccdbcf}.dark .bottom{border-color:#668476}.dark .bottom svg{color:#e5b98c}.dark .micro{color:#a1b9aa}.dark .dot{background:#e5b98c}.stack{width:100%}.mini-note{font-size:23px;color:#d6e4d6;margin-bottom:22px}.request-row{display:flex;align-items:center;gap:22px;background:#fffef8;color:#17333b;padding:25px;margin-bottom:16px;border-radius:5px;border-inline-start:6px solid #d4ab7a}.request-row:nth-child(3){margin-inline-start:26px;margin-inline-end:-8px}.request-row:nth-child(4){margin-inline-start:52px;margin-inline-end:-16px}.request-row>div{flex:1}.request-row b,.request-row small{display:block}.request-row b{font-size:27px}.request-row small{font-size:21px;color:#51666a;margin-top:6px}.pill{font-size:20px;border:1px solid #bfd0bd;background:#edf3e7;border-radius:24px;padding:4px 14px;min-width:88px;text-align:center}.request-row>svg{color:#316a57}.automation-diagram{width:100%;display:grid;justify-items:center}.node{width:90%;display:grid;grid-template-columns:62px 1fr;gap:2px 24px;background:#fffef8;border:1px solid #c7d2c6;padding:18px 26px;position:relative}.node>svg{grid-row:1/3;align-self:center;color:#356452;width:45px;height:45px}.node b{font-size:29px}.node span{font-size:22px;color:#51666a}.node.two{background:#dce7d9;width:82%;transform:translateX(-24px)}.node.three{width:90%;transform:translateX(12px)}.connector{font-size:31px;color:#a34524;height:39px;line-height:39px}.dashboard .metric-grid{display:flex;gap:18px}.metric-grid>div{flex:1;background:#edf1e8;padding:15px 18px;border-radius:5px}.metric-grid small{display:block;font-size:21px;color:#51666a}.metric-grid b{font-size:28px;color:#215958}.chart{height:200px;border-bottom:1px solid #bfd0bd;display:flex;align-items:flex-end;gap:27px;padding:15px 28px 0;margin-top:18px}.chart>div{flex:1;background:#8ba99a;border-radius:7px 7px 0 0}.chart>div:nth-child(3n){background:#c88e62}.chart>div:nth-child(2n){background:#3d7160}.chart-key{font-size:18px;color:#51666a;display:flex;align-items:center;gap:10px;margin-top:18px}.chart-key i{width:10px;height:10px;background:#3d7160;border-radius:50%}.chart-key span{margin-inline-start:auto;font-size:15px}.file-row{display:flex;gap:22px;align-items:center;padding:24px 0;border-top:1px solid #d8ded6}.file-row:first-of-type{border-top:0}.file-row i{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:#ebf0e5;color:#35634a}.file-row>div{flex:1}.file-row b{font-size:29px;display:block}.file-row small{display:block;font-size:23px;color:#51666a}.file-row em{font:18px monospace;color:#61745f}.file-foot{display:flex;align-items:center;gap:14px;border-top:1px dashed #b3c6ac;padding-top:20px;font-size:23px;color:#35634a}.seal{position:absolute;bottom:0;left:-4px;width:138px;height:138px;background:#a34524;color:#fffbec;border-radius:50%;display:grid;place-content:center;text-align:center;line-height:1.6;font-size:25px;font-weight:700;transform:rotate(-12deg);box-shadow:0 6px 15px #8b3e2426}.phases{width:100%;position:relative}.phases:before{content:'';position:absolute;right:34px;top:40px;bottom:40px;border-right:2px dashed #799f86;z-index:-1}.phases>div{display:flex;gap:28px;align-items:center;margin-bottom:18px}.phases>div>span{width:70px;height:70px;background:#e8f0e0;color:#284c40;border-radius:50%;display:grid;place-items:center;font:700 24px monospace;flex-shrink:0;border:8px solid #24483e}.phases section{flex:1;background:#fffef8;padding:16px 25px;border-radius:3px;color:#17333b;border-inline-start:5px solid #d4ab7a}.phases b{font-size:29px}.phases small{display:block;font-size:22px;color:#51666a}.phases>div>svg{color:#c2d5b8}.item h2{font-size:18px;margin:18px 0 10px}.item>p{font-size:14px;line-height:1.9;white-space:pre-line}.item>a{display:inline-block;margin-top:10px}.caption{white-space:pre-wrap;direction:rtl}.item>details{margin-top:15px;line-height:1.9;font-size:14px}.export .gallery-head,.export .item>h2,.export .item>details,.export .item>a{display:none}.export .gallery{display:block;padding:0}.export .item{width:1080px}.export .frame{width:1080px;height:1350px;border-radius:0;box-shadow:none}.export .poster{transform:none}.export .item{display:none}.export .item.selected{display:block}.proof .item>details,.proof .item>a,.proof .gallery-head{display:none}.proof .gallery{padding:30px;gap:28px;grid-template-columns:repeat(3,360px)}.proof .item h2{font-size:16px;text-align:center}.proof{width:1196px}@media(max-width:1220px){body:not(.export):not(.proof) .gallery{grid-template-columns:repeat(2,360px)}}@media(max-width:810px){body:not(.export):not(.proof) .gallery{grid-template-columns:360px;padding-inline:10px}}`;
const sections = facebookPosts
  .map(
    (p, i) =>
      `<section class="item" id="${p.id}"><div class="frame"><article class="poster ${['requests', 'phases'].includes(p.layout) ? 'dark' : ''}" data-id="${p.id}"><header class="top"><div class="brand"><img alt="TEVONIQ" src="data:image/png;base64,${logo}"></div><div class="series"><em>0${i + 1} / 06</em><span>دليل أعمالك</span></div></header><div class="kicker"><i class="dot"></i>${p.topic}</div><h1>${safe(p.title)}<span>${safe(p.accent)}</span></h1><p class="intro">${safe(p.intro)}</p><div class="art">${art(p)}</div><footer class="bottom"><strong>${p.footer}${icon('arrow')}</strong><b>tevoniq.com</b></footer><span class="micro">CLARITY BY DESIGN / TEVONIQ</span></article></div><h2>${i + 1}. ${p.topic}</h2><a href="${p.id}.png" download>تحميل الصورة PNG</a><details><summary>نص المنشور والرابط</summary><p class="caption">${safe(p.caption)}\nhttps://www.tevoniq.com${p.path}</p></details></section>`,
  )
  .join('');
await writeFile(
  new URL('index.html', output),
  `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TEVONIQ — ستة منشورات فيسبوك</title><style>${style}</style><header class="gallery-head"><h1>ستة منشورات بهوية «لماذا TEVONIQ»</h1><p>صور جاهزة بمقاس 1080 × 1350. افتح نص المنشور أسفل كل تصميم وانسخه مع رابطه. لم تُنشر هذه المواد على أي حساب خارجي.</p><a href="facebook-posts.zip" download>تنزيل الحزمة</a> · <a href="captions-ar.md">النصوص المرافقة</a></header><main class="gallery">${sections}</main></html>`,
);
let captions =
  '# نصوص منشورات فيسبوك — TEVONIQ\n\nصور 1080 × 1350 مستوحاة من صفحة لماذا TEVONIQ. المواد جاهزة للمراجعة والنشر بواسطة المالك؛ لم تُنشر تلقائيًا.\n';
for (const [i, p] of facebookPosts.entries())
  captions += `\n## ${i + 1}. ${p.topic}\n\nالصورة: [${p.id}.png](${p.id}.png)\n\n${p.caption}\n\nhttps://www.tevoniq.com${p.path}\n\n#TEVONIQ #حلول_رقمية #منشآت_صغيرة_ومتوسطة\n`;
await writeFile(new URL('captions-ar.md', output), captions);
await writeFile(
  new URL('FONT-LICENSE.txt', output),
  await readFile(new URL('node_modules/@fontsource-variable/cairo/LICENSE', root)),
);
console.log('Prepared six self-contained layouts and Arabic captions.');
