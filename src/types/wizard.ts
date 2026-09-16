export interface ContactData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ItemFormData {
  id: string;
  description: string;
  quantity: number;
  weight: number;
  declaredValue: number;
}

export interface PricingData {
  shipmentType: string;
  status: string;
  dispatchDate: string;
  estimatedDeliveryDate: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  shippingCost: number;
  tax: number;
  insurance: number;
  totalCost: number;
}

export interface CheckpointFormData {
  id: string;
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WizardData {
  sender: ContactData;
  receiver: ContactData;
  items: ItemFormData[];
  pricing: PricingData;
  checkpoints: CheckpointFormData[];
}

export const SHIPMENT_TYPES = ["Express", "Standard", "Freight", "International"] as const;

export const DEFAULT_SENDER: ContactData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

export const DEFAULT_PRICING: PricingData = {
  shipmentType: "Standard",
  status: "Shipment Registered",
  dispatchDate: "",
  estimatedDeliveryDate: "",
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  shippingCost: 0,
  tax: 0,
  insurance: 0,
  totalCost: 0,
};
