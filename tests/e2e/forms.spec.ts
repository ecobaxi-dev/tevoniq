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
  await contactForm.getByLabel('Country', { exact: true }).fill('Türkiye');
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
  await quoteForm.getByLabel('Country', { exact: true }).fill('Türkiye');
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
