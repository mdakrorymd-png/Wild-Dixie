export type Role = "guest" | "host" | "admin";

export type PropertyType = "chalet" | "villa" | "apartment" | "studio" | "cabin" | "room";
export type PropertyStatus = "draft" | "pending_review" | "published" | "rejected" | "suspended";
export type DayStatus = "available" | "blocked" | "booked";
export type BookingStatus =
  | "pending_payment"
  | "pending_approval"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "completed";
export type PaymentMethod = "card" | "instapay" | "vodafone_cash";

export interface User {
  id: string;
  phone_number: string;
  email: string | null;
  full_name: string;
  national_id: string | null;
  passport_image: string | null;
  instapay_handle: string | null;
  vodafone_cash_number: string | null;
  wallet_provider: string | null;
  roles: Role[];
  is_phone_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MessageResponse {
  message: string;
  debug_otp?: string | null;
}

export interface Resort {
  id: string;
  name: string;
  name_ar: string | null;
  area: string;
  governorate: string | null;
  city: string | null;
  rental_allowed: boolean;
  gate_app: string | null;
  beach_code_required: boolean;
  pass_fee: string;
}

export interface Destination {
  area: string;
  governorate: string | null;
  resort_count: number;
}

export interface MonthStatement {
  month: string;
  bookings: number;
  gross: string;
  commission: string;
  net: string;
  paid: string;
  pending: string;
}

export interface OwnerStatement {
  currency: string;
  total_bookings: number;
  total_gross: string;
  total_commission: string;
  total_net: string;
  total_paid: string;
  total_pending: string;
  months: MonthStatement[];
}

export interface Payout {
  id: string;
  booking_id: string;
  gross_amount: string;
  commission_amount: string;
  net_amount: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface Amenity {
  id: string;
  name: string;
  category: string;
  icon: string | null;
}

export interface PropertyImage {
  id: string;
  url: string;
  position: number;
  is_cover: boolean;
}

export interface PropertyListItem {
  id: string;
  title: string;
  property_type: PropertyType;
  area: string;
  base_price_per_night: string;
  currency: string;
  max_guests: number;
  bedrooms: number;
  status: PropertyStatus;
}

export interface Property extends PropertyListItem {
  host_id: string;
  description: string;
  resort_id: string | null;
  resort: Resort | null;
  address_line: string | null;
  beds: number;
  bathrooms: number;
  cleaning_fee: string;
  security_deposit: string;
  down_payment_percentage: number;
  min_nights: number;
  max_nights: number | null;
  utilities_paid_by_guest: boolean;
  house_rules: string | null;
  amenities: Amenity[];
  images: PropertyImage[];
  source_url: string | null;
  rejection_reason: string | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AvailabilityDay {
  date: string;
  status: DayStatus;
}

export interface AvailabilityResponse {
  property_id: string;
  start: string;
  end: string;
  days: AvailabilityDay[];
}

export interface Quote {
  property_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  currency: string;
  nightly_price: string;
  room_subtotal: string;
  cleaning_fee: string;
  security_deposit: string;
  total_amount: string;
  is_deposit: boolean;
  down_payment_percentage: number;
  down_payment_amount: string;
  amount_due_now: string;
  balance_due_later: string;
}

export interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  host_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  guest_national_id: string | null;
  guest_car_plate: string | null;
  gate_pass_status: string;
  status: BookingStatus;
  currency: string;
  total_amount: string;
  amount_due_now: string;
  amount_paid: string;
  is_deposit: boolean;
  cancellation_fee_applied: boolean;
  cancellation_fee_amount: string;
  expires_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface PaymentInstructions {
  method: PaymentMethod;
  amount: string;
  currency: string;
  reference: string;
  pay_to: string | null;
}

export interface ImportedListing {
  source_url: string;
  airbnb_id: string | null;
  title: string | null;
  description: string | null;
  images: string[];
  amenities: string[];
  max_guests: number | null;
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  missing_fields: string[];
}
