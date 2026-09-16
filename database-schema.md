# Database Schema

## shipments
- trackingCode
- status
- shipmentType
- sender
- receiver
- pricing
- dimensions

## timelineEvents
- shipmentId
- title
- description
- location
- eventDate

## routeCheckpoints
- shipmentId
- city
- latitude
- longitude
- sequence

## auditLogs
- action
- adminId
- shipmentId
- timestamp
