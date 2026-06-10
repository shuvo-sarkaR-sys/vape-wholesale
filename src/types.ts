export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Vessels' | 'Vaporizers' | 'Cigar Accessories' | 'Artisanal Pipes' | 'Curated Sets' | 'Disposables' | 'Pod Systems' | 'E-Liquid' | 'Hardware';
  price?: number; // Wholesale price
  suggestedMSRP?: number;
  image: string;
  description: string;
  rating: number;
  specs: {
    material: string;
    dimensions: string;
    origin?: string;
    capacity?: string;
    inStock: boolean;
  };
  features: string[];
}

export interface BusinessAccount {
  businessName: string;
  email: string;
  address: string;
  phone: string;
  licenseNumber: string; // Business/State stamp
  isVerified: boolean;
  registeredAt: string;
  password?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  businessAccount: BusinessAccount;
  status: 'Pending Verification' | 'Processing' | 'Shipped';
  orderDate: string;
  trackingNumber: string;
}
