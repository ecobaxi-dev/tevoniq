import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { resourceLibrary } from '../../apps/web/src/content/resource-library.ts';
const root = fileURLToPath(new URL('../../', import.meta.url)).replace(/\/$/, '');
const font = await fs.readFile(
  root + '/node_modules/@fontsource-variable/cairo/files/cairo-arabic-standard-normal.woff2',
);
const logo = await fs.readFile(root + '/apps/web/public/brand/Hlogo.png');
const b = await chromium.launch({ headless: false });
try {
  for (const [slug, r] of Object.entries(resourceLibrary)) {
    if (r.format !== 'PDF') continue;
    const launch = slug === 'website-launch-checklist';
    const size = launch ? 4 : 3;
    const pages = [];
    for (let i = 0; i < r.sections.length; i += size) {
      pages.push(
        `<section class="page"><header><img src="data:image/png;base64,${logo.toString('base64')}"><span>موارد عملية مجانية</span></header><h1>${r.title}${i ? ' — تابع' : ''}</h1><p class="intro">${r.usage}</p><div class="identity">المشروع: ..................................... &nbsp; التاريخ: ....................</div>${r.sections
          .slice(i, i + size)
          .map(
            ([title, ...q], j) =>
              `<article><h2>${String(i + j + 1).padStart(2, '0')} &nbsp; ${title}</h2>${q.map((t) => `<p>${t}</p>`).join('')}${launch ? '<div class="status">☐ نجح &nbsp; ☐ يحتاج إصلاحًا &nbsp; ☐ غير منطبق</div><div class="line">المسؤول والدليل: </div>' : '<div class="line"></div><div class="line"></div><div class="line"></div>'}</article>`,
          )
          .join(
            '',
          )}<footer>TEVONIQ · www.tevoniq.com/ar/insights/resources<br>احتفظ بنسخة للمراجعة. لا تكتب كلمات مرور أو مفاتيح خدمات في النموذج.</footer></section>`,
      );
    }
    const html = `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><style>@font-face{font-family:Cairo;src:url(data:font/woff2;base64,${font.toString('base64')})}*{box-sizing:border-box}body{margin:0;color:#102747;font-family:Cairo,Arial,sans-serif;font-size:12px;line-height:1.8}.page{break-after:page;padding:0;position:relative}.page:last-child{break-after:auto}header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1594ad;height:65px;margin-bottom:18px}header img{width:150px}header span{font-size:11px;color:#476078}h1{font-size:23px;line-height:1.6;margin:14px 0}h2{font-size:15px;margin:0 0 7px;color:#135c7b}p{margin:7px 0}.intro{color:#476078}.identity{background:#edf5fa;padding:12px;margin:15px 0}article{break-inside:avoid;border-bottom:1px solid #dce6ef;margin:10px 0;padding:10px 0}article p{font-size:12px}.line{height:25px;border-bottom:1px dotted #b2c6d7;color:#61778b}.status{font-size:11px;margin:7px 0}footer{font-size:10px;color:#52687d;margin-top:20px;line-height:1.9}</style><body>${pages.join('')}</body></html>`;
    await fs.writeFile('/tmp/tevoniq-resources-authoring/' + slug + '.html', html);
    const p = await b.newPage();
    await p.setContent(html);
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({
      path: root + '/apps/web/public/downloads/resources/' + r.file,
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '15mm', bottom: '14mm', left: '15mm' },
    });
    await p.close();
    console.log(r.file);
  }
} finally {
  await b.close();
}
