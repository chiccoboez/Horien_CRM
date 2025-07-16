export interface Customer {
  id: string;
  name: string;
  type: 'Customer' | 'OEM' | 'Agent';
  status: 'Active' | 'Prospect';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: 'KSA' | 'Kuwait' | 'UAE' | 'Qatar' | 'Iraq' | 'Egypt' | '';
  };
  paymentTerms: string;
  createdAt: string;
  lastContact: string;
  contacts: Contact[];
  notes: Note[];
  offers: Offer[];
  orders: Order[];
  documents: Document[];
  tasks: Task[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  registrationDate: string;
  expiryDate: string;
  completed: boolean;
  createdAt: string;
  urgent?: boolean;
  veryUrgent?: boolean;
}

export interface BusinessTrip {
  id: string;
  startDate: string;
  endDate: string;
  customersVisited: string[];
  countriesVisited: string[];
  details: string;
  todoList: TodoItem[];
  createdAt: string;
}

export interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface Offer {
  id: string;
  date: string;
  finalUser: string;
  projectName: string;
  offerName: string;
  amount: number;
  ocName: string;
  paid: boolean;
  markedAsOrdered: boolean;
  documents: OfferDocument[];
}

export interface Order {
  id: string;
  date: string;
  finalUser: string;
  projectName: string;
  offerName: string;
  amount: number;
  ocName: string;
  paid: boolean;
  documents: OrderDocument[];
  originalOfferId?: string;
}

export interface OrderDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface OfferDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface ProductFamily {
  id: string;
  name: string;
  description: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  basePrice: number;
  customerPrices: {
    customerId: string;
    price: number;
    discountedPrice?: number;
  }[];
}

export type View = 'dashboard' | 'customers' | 'customer-detail' | 'products' | 'saudi-racks' | 'certification-calculator';