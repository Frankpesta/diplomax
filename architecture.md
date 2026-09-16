# Diplomaxdelivery Architecture

## Frontend
Next.js App Router, TypeScript, Tailwind, shadcn/ui, Framer Motion.

## Backend
Convex:
- Database
- Authentication
- Realtime subscriptions
- Scheduled jobs

## Integrations
- Resend
- MapLibre
- OpenStreetMap

## Realtime Flow
Admin updates shipment -> Convex mutation -> Subscribers updated -> Tracking page refreshes in realtime.
