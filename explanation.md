# Diplomaxdelivery - Product Requirements Document (PRD)

## Version

V1.0

## Product Name

Diplomaxdelivery

## Product Type

Modern courier and logistics tracking platform inspired by FedEx, DHL, and UPS.

---

# 1. Product Overview

Diplomaxdelivery is a logistics and shipment tracking platform that allows administrators to create and manage shipments while enabling public visitors to track shipments in real-time using a tracking code.

The platform combines:

* Public shipment tracking
* Real-time shipment updates
* Route simulation
* Shipment timeline management
* Email notifications
* QR-code based tracking
* Shipment analytics

The platform does not support customer accounts in V1.

All shipments are created and managed by a Super Admin.

---

# 2. Goals

## Business Goals

* Provide a professional courier tracking experience
* Increase customer trust through transparent tracking
* Enable shipment management from a single dashboard
* Reduce support requests through self-service tracking
* Create a scalable foundation for future logistics operations

## User Goals

### Visitors should be able to:

* Search shipments instantly
* View shipment status
* Track package movement
* View delivery progress
* View shipment history

### Administrators should be able to:

* Create shipments
* Update shipment statuses
* Configure routes
* Manage tracking events
* Monitor analytics

---

# 3. Technology Stack

## Frontend

* Next.js (Latest App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Zustand
* React Hook Form
* Zod

## Backend

* Convex

Using:

* Database
* Realtime subscriptions
* Authentication
* Scheduled functions

## Authentication

* Convex Auth
* Email / Password

## Maps

* MapLibre GL JS
* OpenStreetMap

## Emails

* Resend

## QR Codes

* qrcode package

---

# 4. User Roles

## Public Visitor

### Permissions

* Search tracking number
* View shipment details
* View shipment timeline
* View shipment route
* View shipment QR code

No authentication required.

---

## Super Admin

### Permissions

* Login
* Create shipments
* Edit shipments
* Delete shipments
* Archive shipments
* Update shipment status
* Manage routes
* Manage timelines
* Access analytics

---

# 5. Shipment Lifecycle

Default statuses:

1. Created
2. Picked Up
3. In Transit
4. Arrived At Facility
5. Out For Delivery
6. Delivered
7. Failed Delivery
8. Returned
9. Cancelled

Custom statuses supported.

Examples:

* Customs Hold
* Security Inspection
* Weather Delay
* Awaiting Pickup

Custom statuses appear in:

* Timeline
* Tracking Page
* Route Simulation

---

# 6. Shipment Data Structure

## Shipment

* id
* trackingCode
* qrCodeUrl
* status
* shipmentType
* dispatchDate
* estimatedDeliveryDate
* shippingCost
* tax
* insurance
* totalCost
* weight
* length
* width
* height
* originCountry
* destinationCountry
* archived
* createdAt
* updatedAt

## Sender

* fullName
* email
* phone
* address
* city
* state
* country
* postalCode

## Receiver

* fullName
* email
* phone
* address
* city
* state
* country
* postalCode

## Shipment Item

* itemName
* description
* quantity
* weight
* declaredValue

Multiple items per shipment supported.

## Route Checkpoint

* cityName
* country
* latitude
* longitude
* sequence
* arrivalStatus

## Timeline Event

* title
* description
* location
* eventDate
* status

Unlimited timeline entries.

---

# 7. Tracking Code Generation

Format:

```text
DMD-YYYY-RANDOM
```

Example:

```text
DMD-2026-839201
```

Rules:

* Auto-generated
* Globally unique
* Immutable by default
* Editable by admin if necessary

---

# 8. QR Code Tracking

Each shipment automatically generates a QR code.

QR Destination:

```text
/track/[trackingCode]
```

Example:

```text
/track/DMD-2026-839201
```

Users can scan the QR code and instantly access tracking information.

---

# 9. Route Simulation Engine

## Objective

Create a FedEx-style shipment movement experience.

## Workflow

Admin creates route:

```text
Lagos
→ London
→ Paris
→ Berlin
```

When status changes:

```text
Created
→ Picked Up
→ In Transit
→ Arrived At Facility
```

The map marker animates toward the next checkpoint.

## Requirements

* Smooth movement animation
* Framer Motion integration
* Real-time updates
* Convex subscriptions
* Route persistence

---

# 10. Public Website

## Homepage

### Hero

Includes:

* Headline
* Subheadline
* Tracking form

### Services

* Express Delivery
* International Shipping
* Freight Shipping
* Logistics Solutions

### Why Choose Us

### Statistics

Live Convex counters.

### Global Coverage

### FAQ

### Contact Form

### Footer

---

# 11. Public Pages

```text
/
/about
/contact
/services
/services/[slug]
/track/[trackingCode]
```

---

# 12. Tracking Details Page

The flagship page.

## Sections

### Shipment Status Card

Displays:

* Tracking Number
* Current Status
* Estimated Delivery Date

### QR Code

Scannable tracking QR.

### Live Map

MapLibre route display.

### Shipment Timeline

FedEx-style vertical timeline.

### Sender Information

### Receiver Information

### Shipment Items

### Shipment Specifications

* Weight
* Dimensions
* Service Type

### Route Progress

Checkpoint progress visualization.

---

# 13. Admin Dashboard

## Dashboard Metrics

* Total Shipments
* Active Shipments
* Delivered Shipments
* Archived Shipments
* In Transit Shipments
* Failed Deliveries
* Revenue

## Shipments

### Table Columns

* Tracking Number
* Sender
* Receiver
* Status
* Date Created

### Filters

* Tracking Code
* Sender Name
* Receiver Name
* Status
* Shipment Type
* Date Range
* Country

---

# 14. Shipment Creation Wizard

### Step 1

Sender Information

### Step 2

Receiver Information

### Step 3

Shipment Items

### Step 4

Pricing

### Step 5

Route Configuration

### Step 6

Timeline Events

### Step 7

Review & Create

---

# 15. Route Creation

Admin can:

### Search City

System automatically retrieves:

* Latitude
* Longitude

### Select Route Order

Checkpoint sequence builder.

### Preview Route

Map preview before saving.

---

# 16. Shipment Editing

Admin may update:

* Sender
* Receiver
* Status
* Timeline
* Route
* Delivery Dates
* Pricing
* Dimensions
* Shipment Items

Changes are reflected instantly.

---

# 17. Email Notifications

Provider:

**Resend**

Trigger events:

* Shipment Created
* Picked Up
* In Transit
* Arrived At Facility
* Out For Delivery
* Delivered
* Failed Delivery
* Returned
* Cancelled
* Custom Statuses

Emails sent to:

* Receiver
* Sender

---

# 18. Dark Mode

Supported globally.

Using:

* next-themes
* shadcn theme system

Theme options:

* Light
* Dark
* System

---

# 19. Realtime Architecture

Convex subscriptions power:

* Tracking updates
* Timeline updates
* Status changes
* Dashboard metrics
* Route simulation updates

No manual page refresh required.

---

# 20. SEO Strategy

### Indexed

* Home
* About
* Services
* Contact

### Noindex

* Tracking Pages

Reason:

Prevent shipment data appearing in search engines.

---

# 21. Archiving

Delivered shipments automatically archive after:

**90 days**

Archive process:

```text
Delivered
→ 90 Days
→ Archived
```

Admins can still view archived records.

Permanent deletion requires confirmation.

---

# 22. Security

Requirements:

* Protected admin routes
* Server-side authorization
* Rate limiting on tracking search
* Input validation with Zod
* Convex authentication enforcement
* Secure email workflows

---

# 23. Zustand Stores

## Auth Store

* currentUser
* session

## Shipment Store

* currentShipment
* filters

## UI Store

* theme
* sidebarState

## Tracking Store

* trackingResults
* routeSimulationState

---

# 24. Analytics

Dashboard analytics:

* Shipment volume
* Delivery success rate
* Shipment status distribution
* Revenue metrics
* Route performance

---

# 25. Audit Trail (Recommended)

Every admin action should be recorded.

Examples:

* Shipment created
* Shipment edited
* Status changed
* Route modified
* Delivery date updated
* Shipment archived
* Shipment deleted

Fields:

* action
* adminId
* shipmentId
* timestamp
* previousValue
* newValue

Visible only to administrators.

---

# 26. Success Criteria

The MVP is successful when:

* Admin can create shipments
* Public users can track shipments
* QR tracking works
* Route simulation works
* Email notifications work
* Realtime updates work
* Dark mode works
* Mobile responsiveness works
* Auto archiving works

---

# End of PRD
