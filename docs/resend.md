# Resend email on Render

Domain sending records must be verified in Resend. Create a sending-only API key
scoped to `tevoniq.com` and keep it in Render environment variables only.

Set the web service environment:

- `EMAIL_TRANSPORT=resend`
- `RESEND_API_KEY`: the private sending key
- `EMAIL_FROM=notifications@tevoniq.com`

The transport uses HTTPS, not SMTP, and fixes the sender to `EMAIL_FROM`.
Visitor addresses are used only in Reply-To on team notifications. Existing
SMTP and disabled modes remain supported. The Resend key is removed from the
web child process environment and is used only by the API.

In CMS Site Settings → Email, set notification recipients to
`kallas.hossam@gmail.com`. This stored setting controls the destination; an API
key alone does not configure a recipient. Keep confirmations enabled through
the existing contact email worker.

After deployment, submit a contact request and verify both the team notification
and the visitor confirmation in Resend and in the receiving mailboxes. Provider
acceptance is not proof of inbox delivery. The queue runs every 15 seconds while
the Render instance is awake; it cannot deliver while the free instance sleeps.
Existing pending contact emails are processed when email transport is enabled,
including earlier test enquiries. Review the pending queue before activation.

The worker keeps its existing retry policy. Resend requests use a stable
Idempotency-Key from the outbox message identity; provider errors are not exposed
to visitors or stored verbatim. Keys have the provider's finite retention window,
so this does not guarantee unlimited exactly-once delivery.

Validation: API build, lint, and 12 focused tests covering transport payload,
stable retry identity, provider errors, required settings, queue delivery/retries,
and Render configuration. No real email was sent during local tests.

API reference: https://resend.com/docs/api-reference/emails/send-email
