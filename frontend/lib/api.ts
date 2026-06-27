import type {
  AvailabilityResponse,
  Booking,
  Destination,
  ImportedListing,
  MessageResponse,
  OwnerStatement,
  Page,
  PaymentInstructions,
  Property,
  PropertyListItem,
  Quote,
  Resort,
  TokenPair,
  User,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "egypt_rentals_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null, remember = true): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  if (token) {
    // "Remember me" persists across sessions; otherwise only for this tab session.
    (remember ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
  }
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error?.message ?? data?.detail ?? "حدث خطأ غير متوقع";
    const code = data?.error?.code ?? "error";
    throw new ApiError(message, code, res.status);
  }
  return data as T;
}

const qs = (params: Record<string, unknown>): string => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export const api = {
  // ---- auth ----
  register: (body: { phone_number: string; full_name: string; password: string; email?: string }) =>
    request<MessageResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  verifyPhone: (body: { phone_number: string; code: string }) =>
    request<TokenPair>("/auth/verify-phone", { method: "POST", body: JSON.stringify(body) }),
  resendOtp: (body: { phone_number: string }) =>
    request<MessageResponse>("/auth/resend-otp", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { phone_number: string; password: string }) =>
    request<TokenPair>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  forgotPassword: (body: { phone_number: string }) =>
    request<MessageResponse>("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),
  resetPassword: (body: { phone_number: string; code: string; new_password: string }) =>
    request<TokenPair>("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<User>("/users/me"),
  setNationalId: (national_id: string) =>
    request<User>("/users/me/national-id", { method: "PATCH", body: JSON.stringify({ national_id }) }),
  updateProfile: (body: { passport_image?: string; instapay_handle?: string; vodafone_cash_number?: string }) =>
    request<User>("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  becomeHost: () => request<User>("/users/me/become-host", { method: "POST" }),

  // ---- catalog ----
  resorts: (params: { area?: string; q?: string } = {}) =>
    request<Resort[]>(`/catalog/resorts${qs(params)}`),
  destinations: () => request<Destination[]>("/catalog/destinations"),

  // ---- leads (owner estimator + waitlist) ----
  createLead: (body: Record<string, unknown>) =>
    request<{ id: string }>("/leads", { method: "POST", body: JSON.stringify(body) }),
  amenities: () => request<{ id: string; name: string; category: string; icon: string | null }[]>("/catalog/amenities"),

  // ---- properties ----
  searchProperties: (params: Record<string, unknown> = {}) =>
    request<Page<PropertyListItem>>(`/properties${qs(params)}`),
  getProperty: (id: string) => request<Property>(`/properties/${id}`),
  importAirbnb: (url: string) =>
    request<ImportedListing>("/properties/import", { method: "POST", body: JSON.stringify({ url }) }),
  myProperties: () => request<Page<Property>>("/properties/mine"),
  createProperty: (body: Record<string, unknown>) =>
    request<Property>("/properties", { method: "POST", body: JSON.stringify(body) }),
  submitProperty: (id: string) =>
    request<Property>(`/properties/${id}/submit`, { method: "POST" }),

  // ---- calendar ----
  availability: (id: string, params: { start?: string; end?: string } = {}) =>
    request<AvailabilityResponse>(`/properties/${id}/availability${qs(params)}`),

  // ---- bookings ----
  quote: (body: { property_id: string; check_in: string; check_out: string; guests: number; is_deposit: boolean }) =>
    request<Quote>("/bookings/quote", { method: "POST", body: JSON.stringify(body) }),
  createBooking: (body: {
    property_id: string;
    check_in: string;
    check_out: string;
    guests: number;
    is_deposit: boolean;
    car_plate?: string;
  }) => request<Booking>("/bookings", { method: "POST", body: JSON.stringify(body) }),
  myBookings: () => request<Page<Booking>>("/bookings/mine"),
  getBooking: (id: string) => request<Booking>(`/bookings/${id}`),
  paymentInstructions: (id: string, method: string) =>
    request<PaymentInstructions>(`/bookings/${id}/payment-instructions${qs({ method })}`),
  pay: (id: string, body: { method: string; receipt_url?: string; sender_reference?: string }) =>
    request(`/bookings/${id}/pay`, { method: "POST", body: JSON.stringify(body) }),

  // ---- host finance ----
  myPayouts: () =>
    request<{ items: { id: string; net_amount: string; status: string; booking_id: string }[]; total_pending: string; total_paid: string }>(
      "/payouts/mine",
    ),
  ownerStatement: () => request<OwnerStatement>("/payouts/statement"),
  hostingBookings: () => request<Page<Booking>>("/bookings/hosting"),
  setGatePass: (id: string, status: "issued" | "pending") =>
    request<Booking>(`/bookings/${id}/gate-pass`, { method: "POST", body: JSON.stringify({ status }) }),

  // ---- admin ----
  adminPendingProperties: () => request<Page<Property>>("/admin/properties/pending"),
  adminApproveProperty: (id: string) => request<Property>(`/admin/properties/${id}/approve`, { method: "POST" }),
  adminRejectProperty: (id: string, reason: string) =>
    request<Property>(`/admin/properties/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
  adminPendingPayments: () =>
    request<Page<{ id: string; booking_id: string; method: string; amount: string; receipt_url: string | null }>>(
      "/admin/payments/pending",
    ),
  adminApprovePayment: (id: string) => request(`/admin/payments/${id}/approve`, { method: "POST" }),
  adminRejectPayment: (id: string, notes: string) =>
    request(`/admin/payments/${id}/reject`, { method: "POST", body: JSON.stringify({ notes }) }),
  adminDisputes: () =>
    request<{ id: string; booking_id: string; reason: string; status: string }[]>("/admin/disputes"),
};
