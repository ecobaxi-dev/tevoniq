import { test, expect } from '@playwright/test';

test('contact and quote forms validate required fields and submit deterministic fixture requests', async ({
  page,
}) => {
  await page.goto('/en/contact');
  const contactForm = page.locator('.lead-form');
  await expect(contactForm).toBeVisible();
  await contactForm.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(contactForm.getByLabel('Name', { exact: true })).toBeFocused();

  await contactForm.getByLabel('Name', { exact: true }).fill('Casey Fixture');
  await contactForm.getByLabel('Email', { exact: true }).fill('casey.fixture@example.test');
  await contactForm.getByLabel('Country', { exact: true }).selectOption('TR');
  await contactForm.getByLabel('Subject', { exact: true }).fill('Fixture enquiry');
  await contactForm
    .getByLabel('Message', { exact: true })
    .fill('Please contact this test fixture.');
  await contactForm.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your reference: lead-fixture-001');

  await page.goto('/en/request-quote');
  const quoteForm = page.locator('.lead-form');
  await expect(quoteForm).toBeVisible();
  await quoteForm.getByLabel('Name', { exact: true }).fill('Casey Fixture');
  await quoteForm.getByLabel('Email', { exact: true }).fill('casey.quote@example.test');
  await quoteForm.getByLabel('Phone', { exact: true }).fill('+90 555 555 5555');
  await quoteForm.getByLabel('Country', { exact: true }).selectOption('TR');
  await quoteForm.getByLabel('Industry', { exact: true }).fill('Technology');
  await quoteForm.getByLabel('Project type', { exact: true }).fill('Portal');
  await quoteForm.getByLabel('Timeline', { exact: true }).fill('This quarter');
  await quoteForm
    .getByLabel('Project description', { exact: true })
    .fill('A deterministic quote fixture.');
  await quoteForm.getByLabel('Budget range', { exact: true }).selectOption('fixture-budget');
  await quoteForm.getByLabel('Development service fixture', { exact: true }).check();
  await quoteForm
    .getByLabel(
      'I agree that TEVONIQ may use the information and attachments I provide to review this request and contact me about it.',
      { exact: true },
    )
    .check();
  await quoteForm.getByRole('button', { name: 'Request a quote', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your reference: lead-fixture-001');
});

test('Arabic contact form rejects invalid numbers and submits normalized Arabic digits', async ({
  page,
}) => {
  await page.goto('/ar/contact');
  const form = page.locator('.lead-form');
  await form.locator('[name="name"]').fill('زائر تجريبي');
  await form.locator('[name="email"]').fill('visitor@example.test');
  await form.locator('[name="country"]').selectOption('SA');
  await form.locator('[name="phone"]').fill('12345');
  await form.locator('[name="subject"]').fill('طلب موقع');
  await form.locator('[name="message"]').fill('أرغب في مناقشة موقع أعمال.');
  let submissions = 0;
  await page.route('**/api/leads', async (route) => {
    submissions++;
    expect(route.request().postData()).toContain('+966501234567');
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ reference: 'arabic-fixture-001' }),
    });
  });
  await form.locator('[type="submit"]').click();
  await expect(form.getByRole('alert')).toContainText('أدخل رقم هاتف صالحًا');
  expect(submissions).toBe(0);
  await form.locator('[name="phone"]').fill('٠٥٠١٢٣٤٥٦٧');
  await form.locator('[type="submit"]').click();
  await expect(page.locator('.lead-reference bdi')).toHaveText('arabic-fixture-001');
  expect(submissions).toBe(1);
});
