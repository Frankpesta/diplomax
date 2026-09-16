# New-account launch configuration

All implementation and tests were performed locally. No Convex deployment, push, pull, provisioning, or remote database operations were performed. Existing .env.local values were not changed; replace old project references before normal development. Do not use the inherited account.

## Frontend environment

- NEXT_PUBLIC_CONVEX_URL: deployment URL from the NEW Convex project.
- NEXT_PUBLIC_CONVEX_SITE_URL: HTTP action URL from the NEW project.
- NEXT_PUBLIC_APP_URL: https://diplomaxdelivery.com
- NEXT_PUBLIC_TURNSTILE_SITE_KEY: public key for a Cloudflare Turnstile widget allowing diplomaxdelivery.com and www.diplomaxdelivery.com.

## New Convex environment

- ADMIN_SETUP_KEY: a privately generated random secret of at least 32 characters. Required only for initial signup. Never use NEXT_PUBLIC_ for this key. The server atomically grants the first administrator membership and closes subsequent registration, including requests made directly to the auth API. Remove this key after setup.
- RESEND_API_KEY: Resend sending API credential.
- EMAIL_FROM: verified sender, for example Diplomaxdelivery <noreply@notifications.diplomaxdelivery.com>. Verify that sending domain in Resend first.
- SUPPORT_EMAIL: support@diplomaxdelivery.com. Provision the mailbox and verify it receives messages.
- NEXT_PUBLIC_APP_URL: https://diplomaxdelivery.com (also required in the backend for generated tracking links).
- TURNSTILE_SECRET_KEY: private widget key.
- TURNSTILE_ALLOWED_HOSTNAMES: diplomaxdelivery.com,www.diplomaxdelivery.com
- SITE_URL and Convex Auth signing configuration: configure for the new deployment following the installed Convex Auth version. Do not reuse old signing credentials.

No credentials belong in source control or chat. Missing email/Turnstile settings fail closed and do not report success. The contact form displays the support address when its public widget key is absent.

## Accepted behavior

- Public valid DMD tracking codes expose full shipment details, including sender/receiver contact and address information, per the owner's explicit choice. GOX codes are rejected. Management, direct-ID shipment reads, analytics, audit logs, route administration, profile changes, and notification logs require administrator membership.
- Recovery uses an eight-character one-time reset code expiring after ten minutes. Confirmation requires the account email, code, and new password. Provider acceptance is required for a successful send response.
- Contact requests require a server-verified Turnstile token for the configured host and contact action. Persistent atomic limits allow three attempts per normalized email per UTC hour and 100 total per UTC hour. Email identifiers in quota rows are hashed. Provider failures consume the attempt budget.
- Shipment changes and their email jobs save in the same transaction. Temporary email failures retry after one, five, and fifteen minutes. Admins can inspect accepted, retrying, and failed jobs under Email notifications and retry failures within 23 hours. A stable provider idempotency key prevents duplicate sends during retries. Interrupted attempts are recovered by a scheduled job. Accepted means the provider accepted the message, not confirmed inbox delivery; bounce/webhook tracking is not implemented.
- Maps display recorded admin checkpoints with a schematic route; they do not imply connected GPS, precise road routes, or continuous movement.

## Activation checks after provisioning

1. Configure the new Convex Auth deployment and environments, then deploy the prepared code to that new account when authorized.
2. Create the first admin with the private setup key. Verify subsequent signup is rejected server-side. Remove the setup key.
3. Test login and reset end-to-end with the real mailbox, including expired/reused reset codes.
4. Create a shipment and update its status. Confirm sender and receiver emails, tracking links, full public tracking, and admin notification records. Check actual inboxes separately from provider acceptance.
5. Test Turnstile on the real hostname, submit a contact message, confirm support receives it, and verify rejection when the token is missing or invalid.
6. Verify anonymous and non-admin direct backend calls are rejected. Confirm recorded map checkpoints match admin edits.

Local automated tests use an in-memory Convex database and mocked email/challenge responses. They do not prove deployment configuration, DNS, real email delivery, or browser authentication against the new account.

References: [Convex Auth passwords](https://labs.convex.dev/auth/config/passwords), [Cloudflare server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Resend email API](https://resend.com/docs/api-reference/emails/send-email).

Confirmed archival policy: retain automatic archival for shipments held at the airport for 90 days.
