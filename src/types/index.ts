// ID types — these are replaced with Convex generated types after `npx convex dev`
export type ShipmentId = string;
export type UserId = string;
export type AuditLogId = string;

export type ShipmentStatus =
  | "Shipment Registered"
  | "In Transit"
  | "Held at the Airport"
  | string; // custom statuses

export type ShipmentType = "Express" | "Standard" | "Freight" | "International";

export interface Sender {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Receiver {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ShipmentItem {
  description: string;
  quantity: number;
  weight: number;
  declaredValue: number;
}

export interface RouteCheckpoint {
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
  sequence: number;
  arrivalStatus?: "arrived" | "pending" | "current";
}

export interface Shipment {
  _id: ShipmentId;
  trackingCode: string;
  qrCodeUrl?: string;
  status: ShipmentStatus;
  shipmentType: ShipmentType;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  shippingCost: number;
  tax: number;
  insurance: number;
  totalCost: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  sender: Sender;
  receiver: Receiver;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentFilters {
  trackingCode?: string;
  senderName?: string;
  receiverName?: string;
  status?: ShipmentStatus | "";
  shipmentType?: ShipmentType | "";
  dateFrom?: string;
  dateTo?: string;
  country?: string;
  archived?: boolean;
}

export interface AuditLog {
  _id: AuditLogId;
  action: string;
  adminId: UserId;
  shipmentId?: ShipmentId;
  timestamp: string;
  previousValue?: unknown;
  newValue?: unknown;
  details?: string;
}

export interface DashboardMetrics {
  totalShipments: number;
  archivedShipments: number;
  registeredShipments: number;
  inTransitShipments: number;
  heldAtAirportShipments: number;
  totalRevenue: number;
}
