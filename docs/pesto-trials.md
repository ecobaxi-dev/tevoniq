# Pesto Lite trial issuance (disabled foundation)

POST /api/v1/pesto/registrations/trial accepts exactly registrationTicket,
installationId and deviceHash. It requires a verified, unexpired registration
ticket bound to those identities. It is independently disabled by default through
PESTO_TRIAL_ENABLED=false, and also requires registration to be enabled.

## Durable enrollment

Migration 20261024000200_pesto_trial adds PestoTrial and PestoTrialGrant. Installation
ID and device hash each have a unique database constraint. Proof consumption,
trial creation, signing and retry-grant recording commit in one serializable
transaction. A conflict requires retrying the same request. Failed issuance rolls
back proof consumption. No financial or CMS tables are modified.

The first trial is exactly 15 * 24 hours from the server's issue time, never a
client-supplied date. Verified registration establishes the customer identity.
Another request for the SAME customer, installation and device returns the exact
stored permit and original expiry; it cannot restart the trial, including after
expiry. Reinstalling with a new installation ID, changing the device identity under
an existing installation, or enrolling that device under another email/customer
requires support recovery instead of automatically granting another trial.

A consumed proof can recover a lost response for 15 minutes after committed
issuance. This recovery checks the immutable registration binding and grant record;
it cannot be used to mint a new trial. After that window, obtain fresh email proof
for the same identities to recover the original permit. An expired trial returns
status expired and its original expired permit. No reset, delete or transfer API
exists in this foundation. Customer recovery/transfer is still pending.

DeviceHash is currently a client assertion. Until the Windows host supplies a
stable machine fingerprint and protects enrollment, this is not sufficient
reinstallation prevention against a modified client. It cannot guarantee protection
from a machine administrator, virtualization or hardware identity changes. Do not
enable public enrollment or distribute builds based on this component alone.

## Signing configuration

PESTO_LICENSE_KEY_ID is the public key identifier (1–80 ASCII letters, digits,
underscore or hyphen). PESTO_LICENSE_PRIVATE_KEY is base64 PKCS8 DER containing a
DEDICATED P-256 private key, configured only in the API hosting secret store. No
production key has been created or configured. Never reuse source-ownership, email
verification or ZATCA keys. The Render launcher removes the private key from the
web child environment. Error messages contain field names, never key material.

Provision the corresponding SPKI public key and key ID into trusted Windows server
configuration/build resources before enabling issuance. Requests and permits must
never supply their own trust pins. Keep retired PUBLIC keys trusted while permits
signed by them remain usable; stored permits are not re-signed on recovery/key
rotation. Review a managed signing/key-rotation process before production launch.

The envelope matches RestaurantOS Pesto.Licensing v1: exact UTF-8 JSON payload
encoded as base64, SHA-256/ECDSA P-256, 64-byte IEEE P1363 signature, TEVONIQ issuer,
Pesto.Lite product, trial kind, verified email claim and limits 2 users/2 concurrent
devices. It contains opaque identifiers, not email addresses or purchase secrets.
The response uses no-store; never log its permit or registration ticket.

Origin validation and existing signed proxy IP resolution apply. Trial requests
are limited to 20/IP/15 minutes. The [public proxy](pesto-public-proxy.md) and native
client foundation are prepared; production setup remains pending. This endpoint does not implement purchase activation, email-based
password recovery, sale enforcement or an installer.

## Validation

Run npm test and node tests/pesto-trial.integration.mjs. Tests apply all migrations
to in-memory PostgreSQL-compatible storage and create an ephemeral signing key.
They cover duration/signature, exact response retry, proof rollback, duplicate
device/installation, changed owner, expired proof/trial, concurrent enrollment,
HTTP policy, origin/rate limits and disabled/invalid signing configuration.

For cross-language validation, set PESTO_DOTNET_INTEROP_PROJECT to RestaurantOS's
backend/tests/LicensingInteropChecks before running the trial integration. Only a
public synthetic key and signed fixture cross stdin to the .NET verifier. Seven
checks cover acceptance, exact expiry, clock rollback, device/installation binding
and tamper rejection. No private key is written or sent to the verifier.
