export interface Restaurant {
  restaurantId: number;
  name: string;
  ownerUserId: number | null;
  ownerEmail: string | null;
  timezone: string | null;
  currency: string | null;
  settingsJson: string | null;
  /**
   * Some legacy endpoints return `id` instead of `restaurantId`.
   * Keep this optional property for backwards compatibility.
   */
  id?: number;
}

export interface Branch {
  id: number;
  restaurantId: number;
  name: string;
  adminUserId: number | null;
  managerUserId?: number | null;
  managerUsername?: string | null;
  managerEmail?: string | null;
}

export interface UserRecord {
  id: number | null;
  adminUserId?: number | null;
  adminEmail?: string | null;
  username?: string | null;
  email?: string | null;
  role: string;
  restaurantId: number | null;
  branchId: number | null;
  assignedBranchId?: number | null;
  fullName?: string | null;
  phone?: string | null;
  phoneNumber?: string | null; // Staff phone number (required for staff members)
  salaryAmount?: number | null; // Staff salary amount (required for staff members)
  salaryPeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null; // Staff salary period (required for staff members)
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description?: string | null;
  priceCents: number | null;
  price?: number | null;
  category?: string | null;
  isAvailable: boolean;
}

export interface TableEntity {
  id: number;
  restaurantId: number;
  branchId: number;
  name: string | null;
  tableNumber: number | null;
  seatCount: number | null;
  active: boolean;
  qrCode?: string | null;
}

