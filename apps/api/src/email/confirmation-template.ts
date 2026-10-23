const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

export function confirmationHtml(input: {
  name: string;
  reference: string;
  quote: boolean;
  origin: string;
}) {
  const name = escapeHtml(input.name);
  const reference = escapeHtml(input.reference);
  const site = escapeHtml(new URL(input.origin).origin);
  const request = input.quote ? 'quote request' : 'enquiry';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Your ${request} has been received — TEVONIQ</title>
<style>@media only screen and (max-width:620px){.outer{padding:16px 8px!important}.pad{padding:28px 22px!important}.title{font-size:30px!important;line-height:38px!important}.footer{padding:24px 22px!important}}</style></head>
<body style="margin:0;padding:0;background:#f1f4f7;color:#152737;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">Thank you for contacting TEVONIQ. Your ${request} is with our team.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f4f7"><tr><td class="outer" align="center" style="padding:40px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dce3e9;border-radius:12px;overflow:hidden">
<tr><td style="height:5px;background:#D4AF37;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td class="pad" style="padding:32px 40px;background:#0A1F44"><a href="${site}/en" style="color:#ffffff;text-decoration:none;font-size:25px;font-weight:bold;letter-spacing:4px">TEVONIQ<span style="color:#D4AF37">.</span></a><p style="margin:10px 0 0;color:#becbd3;font-size:11px;letter-spacing:2px">TECHNOLOGY &amp; BUSINESS SOLUTIONS</p></td></tr>
<tr><td class="pad" style="padding:36px 40px">
<p style="margin:0 0 18px;color:#467661;font-size:12px;font-weight:bold;letter-spacing:2px">REQUEST RECEIVED</p>
<h1 class="title" style="margin:0 0 22px;font-size:36px;line-height:43px;font-weight:bold;color:#0A1F44">Thank you for<br>reaching out.</h1>
<p style="margin:0 0 12px;font-size:16px;line-height:26px">Hello ${name},</p>
<p style="margin:0 0 26px;color:#536271;font-size:15px;line-height:25px">Your ${request} has been successfully received. Our team will review the details and follow up using the contact information you provided.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6f8;border:1px solid #dce3e9;border-radius:8px"><tr><td style="padding:20px"><p style="margin:0 0 9px;font-size:11px;color:#536271;letter-spacing:1px;font-weight:bold">YOUR REFERENCE NUMBER</p><p style="margin:0;font:13px/22px 'Courier New',monospace;color:#0A1F44;word-break:break-all">${reference}</p><p style="margin:10px 0 0;font-size:12px;line-height:19px;color:#637180">Keep this number handy when contacting our team.</p></td></tr></table>
<h2 style="margin:30px 0 18px;font-size:18px;color:#0A1F44">What happens next?</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td width="32" valign="top" style="padding:0 0 18px;font-size:14px;font-weight:bold;color:#a57935">01</td><td style="padding:0 0 18px;font-size:14px;line-height:23px"><strong>We review your request</strong><br><span style="color:#637180">We look at your requirements and identify the right next steps.</span></td></tr>
<tr><td width="32" valign="top" style="font-size:14px;font-weight:bold;color:#a57935">02</td><td style="font-size:14px;line-height:23px"><strong>Our team gets in touch</strong><br><span style="color:#637180">We follow up to discuss your needs and any further details.</span></td></tr></table>
<p style="margin:28px 0 20px;font-size:14px;line-height:23px;color:#536271">Need to add something? Email our team and include your reference number.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#0A1F44" style="border-radius:6px"><a href="mailto:kallas.hossam@gmail.com?subject=Enquiry%20${encodeURIComponent(input.reference)}" style="display:inline-block;padding:15px 24px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border:1px solid #0A1F44;border-radius:6px">Contact our team &rarr;</a></td></tr></table>
<p style="margin:28px 0 0;font-size:14px;line-height:23px;color:#536271">We look forward to learning more about your project.<br><strong style="color:#0A1F44">The TEVONIQ team</strong></p>
</td></tr>
<tr><td class="footer" style="padding:26px 40px;background:#f8fafb;border-top:1px solid #e3e9ed"><p style="margin:0 0 10px;font-size:12px;line-height:21px;color:#536271"><a href="${site}/en" style="color:#0A1F44;text-decoration:underline">Visit our website</a> &nbsp;&middot;&nbsp; İstanbul, Türkiye<br><a href="tel:+905550188126" style="color:#536271;text-decoration:none">+90 555 018 81 26</a></p><p style="margin:0 0 10px;font-size:10px;line-height:17px;color:#71808c">EVE WASEL ALIŞVERİŞ İTHALAT İHRACAT LİMİTED ŞİRKETİ</p><p style="margin:0;font-size:11px;line-height:18px;color:#71808c">You received this email because an enquiry was submitted through TEVONIQ. This is a confirmation of receipt.</p></td></tr>
</table></td></tr></table></body></html>`;
}
