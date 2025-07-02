import { Customer, ProductFamily } from '../types';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    type: 'OEM',
    status: 'Active',
    email: 'contact@acmecorp.com',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'UAE'
    },
    paymentTerms: 'Net 30',
    createdAt: '2024-01-15',
    lastContact: '2024-01-20',
    contacts: [],
    notes: [],
    orders: [
      {
        id: '1',
        date: '2024-01-15',
        finalUser: 'Tech Solutions Inc',
        projectName: 'Battery Management System',
        offerName: 'BMS-2024-001',
        amount: 15000,
        ocName: 'John Smith',
        paid: true,
        documents: []
      },
      {
        id: '2',
        date: '2024-01-20',
        finalUser: 'Energy Corp',
        projectName: 'Solar Storage Solution',
        offerName: 'SSS-2024-002',
        amount: 25000,
        ocName: 'Jane Doe',
        paid: false,
        documents: []
      }
    ],
    documents: [],
    tasks: [
      {
        id: '1',
        title: 'Follow up on BMS project',
        description: 'Contact customer about project timeline and requirements',
        registrationDate: '2024-01-15',
        expiryDate: '2024-02-15',
        completed: false,
        createdAt: '2024-01-15T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'TechStart Solutions',
    type: 'Customer',
    status: 'Prospect',
    email: 'hello@techstart.com',
    phone: '+1 (555) 987-6543',
    address: {
      street: '456 Innovation Dr',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'KSA'
    },
    paymentTerms: 'Net 15',
    createdAt: '2024-01-10',
    lastContact: '2024-01-18',
    contacts: [],
    notes: [],
    orders: [
      {
        id: '3',
        date: '2024-01-18',
        finalUser: 'Smart Grid Systems',
        projectName: 'Grid Storage Pilot',
        offerName: 'GSP-2024-003',
        amount: 8500,
        ocName: 'Mike Johnson',
        paid: true,
        documents: []
      }
    ],
    documents: [],
    tasks: [
      {
        id: '2',
        title: 'Prepare technical proposal',
        description: 'Create detailed technical proposal for grid storage solution',
        registrationDate: '2024-01-10',
        expiryDate: '2024-01-25',
        completed: true,
        createdAt: '2024-01-10T14:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'Global Manufacturing Inc',
    type: 'OEM',
    status: 'Active',
    email: 'procurement@globalmanuf.com',
    phone: '+1 (555) 456-7890',
    address: {
      street: '789 Industrial Blvd',
      city: 'Detroit',
      state: 'MI',
      zipCode: '48201',
      country: 'Kuwait'
    },
    paymentTerms: 'Net 45',
    createdAt: '2023-12-05',
    lastContact: '2024-01-19',
    contacts: [],
    notes: [],
    orders: [
      {
        id: '4',
        date: '2024-01-19',
        finalUser: 'Industrial Automation Ltd',
        projectName: 'Factory Backup Power',
        offerName: 'FBP-2024-004',
        amount: 35000,
        ocName: 'Sarah Wilson',
        paid: false,
        documents: []
      }
    ],
    documents: [],
    tasks: [
      {
        id: '3',
        title: 'Site visit for factory assessment',
        description: 'Visit customer site to assess power requirements and installation constraints',
        registrationDate: '2024-01-19',
        expiryDate: '2024-02-05',
        completed: false,
        createdAt: '2024-01-19T09:00:00Z'
      }
    ]
  },
  {
    id: '4',
    name: 'Innovation Labs',
    type: 'Customer',
    status: 'Active',
    email: 'orders@innovationlabs.com',
    phone: '+1 (555) 321-9876',
    address: {
      street: '321 Research Park',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'Qatar'
    },
    paymentTerms: 'Net 30',
    createdAt: '2024-01-08',
    lastContact: '2024-01-17',
    contacts: [],
    notes: [],
    orders: [
      {
        id: '5',
        date: '2024-01-17',
        finalUser: 'Research Institute',
        projectName: 'Lab Equipment Power',
        offerName: 'LEP-2024-005',
        amount: 12000,
        ocName: 'David Brown',
        paid: true,
        documents: []
      }
    ],
    documents: [],
    tasks: []
  }
];

export const mockProductFamilies: ProductFamily[] = [
  {
    id: '1',
    name: 'Electronic Components',
    description: 'High-quality electronic components for various applications',
    products: [
      {
        id: '1',
        name: 'Microcontroller MCU-001',
        sku: 'MCU-001',
        description: '32-bit ARM Cortex microcontroller',
        basePrice: 15.99,
        customerPrices: [
          { customerId: '1', price: 14.50, discountedPrice: 13.50 },
          { customerId: '3', price: 13.99, discountedPrice: 12.99 }
        ]
      },
      {
        id: '2',
        name: 'Sensor Module SEN-205',
        sku: 'SEN-205',
        description: 'Temperature and humidity sensor',
        basePrice: 8.75,
        customerPrices: [
          { customerId: '1', price: 7.99, discountedPrice: 7.50 },
          { customerId: '2', price: 8.25, discountedPrice: 8.00 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Power Management',
    description: 'Efficient power management solutions',
    products: [
      {
        id: '3',
        name: 'DC-DC Converter PWR-100',
        sku: 'PWR-100',
        description: 'High-efficiency step-down converter',
        basePrice: 22.50,
        customerPrices: [
          { customerId: '1', price: 20.25, discountedPrice: 19.00 },
          { customerId: '3', price: 19.99, discountedPrice: 18.50 }
        ]
      },
      {
        id: '4',
        name: 'Battery Charger CHG-301',
        sku: 'CHG-301',
        description: 'Smart lithium battery charger IC',
        basePrice: 12.25,
        customerPrices: [
          { customerId: '2', price: 11.75, discountedPrice: 11.25 },
          { customerId: '4', price: 11.50, discountedPrice: 11.00 }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Communication Modules',
    description: 'Wireless and wired communication solutions',
    products: [
      {
        id: '5',
        name: 'WiFi Module WIF-401',
        sku: 'WIF-401',
        description: '802.11ac dual-band WiFi module',
        basePrice: 18.99,
        customerPrices: [
          { customerId: '1', price: 17.50, discountedPrice: 16.75 },
          { customerId: '4', price: 18.25, discountedPrice: 17.50 }
        ]
      }
    ]
  }
];