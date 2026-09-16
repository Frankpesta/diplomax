# Diplomaxdelivery design and functionality review

Implemented locally: forest/ivory/lime theme, custom D-and-arrow mark, SVG/PNG logo variants, favicon and Apple icon, React Three Fiber delivery globe, redesigned landing and public pages, and coordinated dashboard/auth/tracking/admin styling.

Brand colors: forest #123D32, action green #245B45, electric lime #C7F36B, warm ivory #F8F9F4. Artwork lives in public/brand; regenerate bitmap/icon assets with `node scripts/brand-assets.mjs`.

Tracking uses DMD-YYYY-NNNNNN only. Old-brand codes are rejected. Confirmed domain: https://diplomaxdelivery.com. Confirmed support address: support@diplomaxdelivery.com.

## Functional decisions implemented

1. Initial admin registration requires a private server setup key. The first membership is created atomically with the account; subsequent new registrations are rejected server-side.
2. Backend administrator membership protects shipment management, direct-ID reads, analytics, audit logs, route administration, profile changes, and email notification logs.
3. Full shipment details remain public to holders of a valid tracking code, including personal/contact information, as explicitly requested.
4. Resend password recovery is configured in source with ten-minute one-time codes. Reset confirmation now submits the email required by the Password provider. Live recovery requires new-account credentials and sender verification.
5. Email actions inspect HTTP status and response payloads before reporting provider acceptance. Shipment saves enqueue durable email jobs; temporary failures retry, and administrators can inspect and retry failures from Email notifications. Provider acceptance is distinguished from inbox delivery.
6. Public contact submissions require server-side Turnstile verification plus persistent atomic hourly limits: three per normalized email and 100 globally. Missing configuration fails closed.
7. Maps show recorded administrator checkpoints and schematic routes without simulated courier movement or live GPS claims.

## Deployment boundary

No Convex push, pull, deployment, provisioning, or remote data operations were performed. Existing .env.local project values remain untouched. Normal development must wait until these references point to the NEW project. Local builds override Convex URLs to localhost.

See [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md) for the required frontend/backend settings and post-provisioning acceptance checks. This includes provisioning the confirmed support mailbox, verifying the Resend sender, and configuring Turnstile.

Old chat integrations and inherited company history, people, addresses, awards, and performance statistics were removed. Replacement copy describes plausible services without inventing business credentials or performance claims.

## Verification and outstanding scope

102 automated tests pass, including in-memory backend authorization, first-admin transaction rollback, public full-detail tracking, old-code rejection, contact quota/Turnstile failures, provider failure classification, durable notification states, retry limits, and idempotency-window protection. TypeScript checks and the production build pass. Tests do not contact Convex or send real emails.

Prior desktop/mobile browser review covered the redesign, navigation, themes, About, contact, and dashboard fixture states. The temporary dashboard review HTML was removed. Real authentication, reset-code expiry/reuse, actual mailbox delivery, and deployed scheduler behavior require the new account and remain launch checks.

Repository-wide lint still reports the inherited shipment wizard synchronous initialization effect at src/app/(admin)/admin/(dashboard)/shipments/new/page.tsx, plus warnings. Next.js also reports the inherited middleware-to-proxy deprecation notice.

Confirmed business policy: shipments marked Held at the Airport continue to be automatically archived after 90 days. The existing scheduled process is retained as requested.

