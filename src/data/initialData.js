export const CATEGORIES = [
  { id: 'sound', name: 'Sound Crackers' },
  { id: 'fancy', name: 'Fancy Crackers' },
  { id: 'chakkar', name: 'Ground Chakkars' },
  { id: 'rocket', name: 'Rockets' },
  { id: 'bomb', name: 'Bombs' },
  { id: 'sparkler', name: 'Sparklers' },
  { id: 'flowerpot', name: 'Flower Pots' },
  { id: 'multishot', name: 'Multi Shots' },
  { id: 'giftbox', name: 'Gift Boxes' },
  { id: 'kids', name: 'Kids Crackers' },
  { id: 'other', name: 'Other Items' }
];

export const INITIAL_SHOP = {
  name: "Sri Gugan Crackers",
  tagline: "Direct Sivakasi Fireworks • Retail & Wholesale",
  logo: "/logo.png",
  address: "Sattur Road, Near Bus Stand",
  city: "Sivakasi",
  district: "Virudhunagar",
  state: "Tamil Nadu",
  pincode: "626123",
  mobile: "94431 23456",
  altMobile: "98421 23456",
  email: "billing@fireworks.com",
  gstin: "33AAAAA0000A1Z5",
  stateCode: "33",
  invoicePrefix: "INV-",
  nextInvoiceNum: 1,
  nextOrderNum: 1,
  footerMessage: "Thank you for your purchase! Visit Again.",
  terms: "1. Goods once sold will not be exchanged or refunded.\n2. Store crackers in a cool, dry place.\n3. Always light crackers under adult supervision.\n4. Subject to Sivakasi Jurisdiction.",
  printFormat: "a4", // "a4", "performa", "thermal"
  taxInclusive: true,
  defaultTaxRate: 12,
  upiId: "fireworks@upi",
  website: "www.shrigugancrackers.com"
};


// Pure clean slate - Zero dummy data as requested by user
export const INITIAL_PRODUCTS = [];
export const INITIAL_CUSTOMERS = [];
export const INITIAL_SUPPLIERS = [];
export const INITIAL_SALES = [];
export const INITIAL_PURCHASES = [];
export const INITIAL_RETURNS = [];
