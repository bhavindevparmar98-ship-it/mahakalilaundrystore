export type ServiceCategory = "wash" | "dryclean" | "iron" | "saree";

export type PricingUnit = "kg" | "piece";

export interface LaundryService {
  slug: string;
  name: string;
  category: ServiceCategory;
  tagline: string;
  description: string;
  price: number;
  unit: PricingUnit;
  turnaround: string;
  highlights: string[];
}

export interface BookingItem {
  serviceSlug: string;
  quantity: number;
}

export type OrderStatus =
  | "placed"
  | "picked_up"
  | "processing"
  | "quality_check"
  | "out_for_delivery"
  | "delivered";

export type PaymentMethod = "cod" | "upi_on_pickup";

export interface OrderTimelineEntry {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  pincode: string;
  items: BookingItem[];
  pickupDate: string;
  pickupSlot: string;
  dropDate: string;
  dropSlot: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  /**
   * Demo-mode flag: set by the admin panel when staff manually moves an order
   * so the time-based demo progression does not override the manual status.
   */
  statusLocked?: boolean;
  timeline: OrderTimelineEntry[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "customer";
}

/** Panel roles. On the Laravel side these map to Filament panel roles. */
export type AdminRole = "admin" | "manager" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: AdminRole;
  active: boolean;
  joinedAt: string;
}

export interface AdminCustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  pincode: string;
  orders: number;
  totalSpend: number;
  lastOrderAt: string;
}
