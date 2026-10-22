import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { once } from 'node:events';
import {
  jobWriteSchema,
  applicationSubmitSchema,
  applicationStatuses,
  MAX_CV_BYTES,
} from '../packages/validation/dist/index.js';
import { validateCv, CvSecurity, scanClamAv } from '../apps/api/dist/careers/cv-security.js';
import {
  CareersController,
  CmsCareersController,
  publicJobWhere,
  publicJobSelect,
} from '../apps/api/dist/careers/careers.controller.js';
import { enforceEndpoint } from '../apps/api/dist/cms/permissions.js';
export const jobFixture = () => ({
  title: 'Test role',
  slug: 'test-role',
  department: 'Engineering',
  location: 'Remote',
  employmentType: 'FULL_TIME',
  workMode: 'REMOTE',
  description: 'Test description',
  responsibilities: ['Build software'],
  requirements: ['Relevant experience'],
  preferredQualifications: [],
  status: 'PUBLISHED',
  publishedAt: '2026-01-01T00:00:00.000Z',
  closingDate: null,
  version: 0,
});
const pdf = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n',
);
const file = (bytes = pdf, name = 'CV.pdf', mimetype = 'application/pdf') => ({
  buffer: bytes,
  size: bytes.length,
  originalname: name,
  mimetype,
});
test('Jobs validate all requested fields, enums and publication dates', () => {
  const value = jobFixture();
  assert.equal(jobWriteSchema.safeParse(value).success, true);
  for (const patch of [
    { workMode: 'ANY' },
    { employmentType: 'TEMP' },
    { status: 'OPEN' },
    { requirements: [] },
    { publishedAt: null },
    { closingDate: '2025-01-01T00:00:00Z' },
    { slug: '../private' },
    { html: '<script/>' },
  ])
    assert.equal(jobWriteSchema.safeParse({ ...value, ...patch }).success, false);
});
test('Application schema rejects status injection, unsafe URLs, missing consent and unsupported fields', () => {
  const value = {
    submissionId: randomUUID(),
    jobSlug: 'test-role',
    name: 'Candidate',
    email: 'Candidate@example.test',
    phone: '',
    location: 'Test city',
    linkedIn: '',
    portfolio: '',
    coverLetter: '',
    consent: true,
  };
  assert.equal(applicationSubmitSchema.parse(value).email, 'candidate@example.test');
  const optionalDefaults = applicationSubmitSchema.parse(
    Object.fromEntries(
      Object.entries(value).filter(
        ([key]) => !['phone', 'linkedIn', 'portfolio', 'coverLetter'].includes(key),
      ),
    ),
  );
  assert.deepEqual(
    {
      phone: optionalDefaults.phone,
      linkedIn: optionalDefaults.linkedIn,
      portfolio: optionalDefaults.portfolio,
      coverLetter: optionalDefaults.coverLetter,
    },
    { phone: '', linkedIn: '', portfolio: '', coverLetter: '' },
  );
  for (const patch of [
    { status: 'HIRED' },
    { linkedIn: 'javascript:alert(1)' },
    { portfolio: 'http://example.test' },
    { consent: false },
    { cvPath: '/private' },
  ])
    assert.equal(applicationSubmitSchema.safeParse({ ...value, ...patch }).success, false);
  assert.deepEqual(applicationStatuses, [
    'NEW',
    'REVIEWING',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFER',
    'HIRED',
    'REJECTED',
  ]);
});
test('Public job selection enforces publication, schedule and closing dates without applicant relations', async () => {
  const now = new Date();
  assert.deepEqual(publicJobWhere(now), {
    status: 'PUBLISHED',
    publishedAt: { lte: now },
    OR: [{ closingDate: null }, { closingDate: { gt: now } }],
  });
  assert.equal('applications' in publicJobSelect, false);
  assert.equal('createdById' in publicJobSelect, false);
  let query;
  const controller = new CareersController(
    {
      careerJob: {
        findFirst: async (q) => {
          query = q;
          return null;
        },
      },
    },
    {},
    {},
    {},
  );
  await assert.rejects(controller.detail('closed-role'), { status: 404 });
  assert.equal(query.where.status, 'PUBLISHED');
  assert.deepEqual(query.select, publicJobSelect);
});
test('CV validation bounds bytes, verifies MIME/signature/completeness and sanitizes names', () => {
  assert.equal(validateCv(file(pdf, '../../resume.pdf')).name, 'resume.pdf');
  for (const value of [
    undefined,
    file(Buffer.from('not a PDF')),
    file(pdf, 'resume.pdf.exe'),
    file(pdf, 'resume.pdf', 'text/html'),
    file(pdf.subarray(0, -7)),
    file(Buffer.alloc(MAX_CV_BYTES + 1)),
    { ...file(), size: 1 },
  ])
    assert.throws(() => validateCv(value), { status: 400 });
  for (const name of ['/JavaScript', '/J#53', '/Encrypt', '/EmbeddedFile', '/Launch'])
    assert.throws(() => validateCv(file(Buffer.from(`%PDF-1.4\n<< ${name} >>\n%%EOF\n`))), {
      status: 400,
    });
});
test('Production CV uploads fail closed without a scanner', async () => {
  const security = new CvSecurity({
    get: (key) => (key === 'NODE_ENV' ? 'production' : undefined),
  });
  await assert.rejects(security.validate(file()), { status: 503 });
  const dev = new CvSecurity({ get: () => undefined });
  assert.equal((await dev.validate(file())).scanStatus, 'DEVELOPMENT_UNSCANNED');
});
test('ClamAV stream adapter accepts only a clean verdict and rejects infection or scanner errors', async () => {
  for (const [reply, expected] of [
    ['stream: OK\0', null],
    ['stream: Test-Signature FOUND\0', 400],
    ['INSTREAM size limit exceeded. ERROR\0', 503],
  ]) {
    const server = createServer((socket) => {
      socket.once('data', (bytes) => {
        assert.equal(bytes.subarray(0, 10).toString(), 'zINSTREAM\0');
        socket.end(reply);
      });
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
      const result = scanClamAv(pdf, '127.0.0.1', server.address().port);
      if (expected) await assert.rejects(result, { status: expected });
      else await result;
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
});
test('Only HR and administrators may read applications, history and CVs or add review updates', () => {
  for (const role of [
    'SUPER_ADMIN',
    'ADMIN',
    'HR',
    'CONTENT_MANAGER',
    'EDITOR',
    'MARKETING',
    'SALES',
    'VIEWER',
  ]) {
    for (const handler of ['applications', 'application', 'cv', 'history', 'status', 'note']) {
      const call = () =>
        enforceEndpoint('CmsCareersController', handler, {
          cmsUser: { role },
          body: {},
          method: 'POST',
          params: {},
        });
      if (['SUPER_ADMIN', 'ADMIN', 'HR'].includes(role)) assert.doesNotThrow(call);
      else assert.throws(call, { status: 403 });
    }
  }
});
test('Stale application reviews cannot change status or append history', async () => {
  const db = {
    jobApplication: {
      findUnique: async () => ({ version: 4, status: 'NEW' }),
      update: () => assert.fail('must not write'),
    },
    $transaction: async (fn) => fn(db),
  };
  await assert.rejects(
    new CmsCareersController(db).status(
      randomUUID(),
      { status: 'HIRED', version: 3 },
      { cmsUser: { id: randomUUID() } },
    ),
    { status: 409 },
  );
});
