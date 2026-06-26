import { MongoClient, Db } from 'mongodb';
import dns from 'node:dns';
import { Product, BusinessAccount } from '../types';
import { PRODUCTS } from '../data/products';
import { hashPassword } from './security';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Let's model a robust B2B Order interface for backend persistence in our collections
export interface DbOrder {
  id: string;
  buyerEmail: string;
  businessName: string;
  items: Array<{
    product: Product;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Dispatched' | 'Completed';
  createdAt: string;
  
}

// In-Memory Fallback store in case MongoDB URI is not active
class InMemoryDatabase {
  products: Product[] = [];
  buyers: BusinessAccount[] = [];
  orders: DbOrder[] = [];

  constructor() {
    this.products = JSON.parse(JSON.stringify(PRODUCTS));
    
    // Seed default verified buyers with memory-hard hashes
    this.buyers = [
      {
        businessName: 'Apex Smoke Distributors LLC',
        email: 'apex.distributor@pacificsmoke.com',
        address: '100 Apex Way, Toronto, ON, M5V 2N8',
        phone: '(416) 555-0199',
        licenseNumber: 'SMK-LIC-400192',
        
        isVerified: true,
        registeredAt: 'January 14, 2026',
        password: hashPassword('apex-secured-wholesale')
      },
      {
        businessName: 'Vape Empire HQ',
        email: 'merchant@vapeshop.com',
        address: '455 Broad Street, Vancouver, BC, V6B 1P4',
        phone: '(604) 555-0142',
        licenseNumber: 'VPE-REG-982110',
        
        isVerified: true,
        registeredAt: 'March 28, 2026',
        password: hashPassword('merchant-verified-buyer')
      }
    ];
  }
}

const memoryDb = new InMemoryDatabase();

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let dbType: 'MongoDB' | 'In-Memory Fallback' = 'In-Memory Fallback';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not detected in environment variables. Operating in In-Memory fallback mode.');
    dbType = 'In-Memory Fallback';
    isConnected = false;
    return { isConnected: false, dbType, error: 'MONGODB_URI is undefined' };
  }

  if (client && isConnected && db) {
    return { isConnected: true, dbType };
  }

  const connectWithUri = async () => {
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db('pacific_smoke_b2b');
    isConnected = true;
    dbType = 'MongoDB';
    console.log('✅ Connected securely to live MongoDB cluster!');

    // Run automatic migration & seeding
    await seedDatabaseIfNeeded();
    return { isConnected: true, dbType };
  };

  try {
    return await connectWithUri();
  } catch (err: any) {
    const shouldRetryWithPublicDns =
      uri.startsWith('mongodb+srv://') &&
      typeof err?.message === 'string' &&
      /querysrv|querya/i.test(err.message);

    if (shouldRetryWithPublicDns) {
      try {
        const originalServers = dns.getServers();
        const fallbackServers = (process.env.MONGODB_DNS_SERVERS || '1.1.1.1,8.8.8.8')
          .split(',')
          .map(server => server.trim())
          .filter(Boolean);

        dns.setServers(fallbackServers);
        const retryResult = await connectWithUri();
        dns.setServers(originalServers);
        return retryResult;
      } catch (retryErr: any) {
        console.error('❌ MongoDB retry with public DNS also failed.', retryErr.message);
      }
    }

    console.error('❌ MongoDB client connection failed. Falling back to local memory engine.', err.message);
    client = null;
    db = null;
    dbType = 'In-Memory Fallback';
    isConnected = false;
    return { isConnected: false, dbType, error: err.message };
  }
}

// Seeding engine
async function seedDatabaseIfNeeded() {
  if (!db) return;
  try {
    const buyersColl = db.collection('buyers');

    if (PRODUCTS.length > 0) {
      const productsColl = db.collection('products');
      const count = await productsColl.countDocuments();
      if (count === 0) {
        console.log(`🌱 Seeding ${PRODUCTS.length} catalog products into MongoDB 'products' collection...`);
        await productsColl.insertMany(JSON.parse(JSON.stringify(PRODUCTS)));
      }
    }

    const buyerCount = await buyersColl.countDocuments();
    if (buyerCount === 0) {
      console.log(`🌱 Seeding default verified retail buyers into MongoDB...`);
      await buyersColl.insertMany(JSON.parse(JSON.stringify(memoryDb.buyers)));
    }
  } catch (err) {
    console.error('Failed to seed MongoDB collections:', err);
  }
}

// Database Operations Manager to elegantly route query loads
export const dbOperations = {
  getDbType: () => dbType,
  getIsConnected: () => isConnected,

  // PRODUCT ENDPOINTS
  async getProducts(): Promise<Product[]> {
    await connectToDatabase();
    if (isConnected && db) {
      const items = await db.collection('products').find({}).toArray();
      return items.map((item: any) => {
        const { _id, ...rest } = item;
        return rest as Product;
      });
    }
    return memoryDb.products;
  },

  async addProduct(product: Product): Promise<boolean> {
    await connectToDatabase();
    if (isConnected && db) {
      const { ...prodCopy } = product;
      await db.collection('products').insertOne(prodCopy);
      return true;
    }
    memoryDb.products.push(JSON.parse(JSON.stringify(product)));
    return true;
  },

  async updateProduct(id: string, updated: Partial<Product>): Promise<boolean> {
    await connectToDatabase();
    if (isConnected && db) {
      await db.collection('products').updateOne({ id }, { $set: updated });
      return true;
    }
    const index = memoryDb.products.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryDb.products[index] = { ...memoryDb.products[index], ...updated };
      return true;
    }
    return false;
  },

  async deleteProduct(id: string): Promise<boolean> {
    await connectToDatabase();
    if (isConnected && db) {
      await db.collection('products').deleteOne({ id });
      return true;
    }
    const index = memoryDb.products.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryDb.products.splice(index, 1);
      return true;
    }
    return false;
  },

  // BUYERS ACCOUNT ENDPOINTS
  async getBuyers(): Promise<BusinessAccount[]> {
    await connectToDatabase();
    if (isConnected && db) {
      const buyers = await db.collection('buyers').find({}).toArray();
      return buyers.map((b: any) => {
        const { _id, ...rest } = b;
        return rest as BusinessAccount;
      });
    }
    return memoryDb.buyers;
  },

  async registerBuyer(account: BusinessAccount): Promise<boolean> {
    await connectToDatabase();
    // Clone and hash the input credentials before write ops
    const accountCopy = JSON.parse(JSON.stringify(account));
    accountCopy.email = accountCopy.email.toLowerCase().trim();
    accountCopy.password = hashPassword(accountCopy.password);

    if (isConnected && db) {
      // Check if already exists
      const existing = await db.collection('buyers').findOne({
        email: { $regex: `^${escapeRegex(accountCopy.email)}$`, $options: 'i' }
      });
      if (existing) return false;
      
      await db.collection('buyers').insertOne(accountCopy);
      return true;
    }
    if (memoryDb.buyers.some(b => b.email.toLowerCase() === accountCopy.email.toLowerCase())) {
      return false;
    }
    memoryDb.buyers.push(accountCopy);
    return true;
  },

  async updateBuyerPassword(email: string, password: string): Promise<boolean> {
    await connectToDatabase();
    const lookupEmail = email.toLowerCase().trim();
    const hashedPassword = hashPassword(password);

    if (isConnected && db) {
      const result = await db.collection('buyers').updateOne(
        { email: { $regex: `^${escapeRegex(lookupEmail)}$`, $options: 'i' } },
        { $set: { password: hashedPassword } }
      );
      return result.matchedCount > 0;
    }

    const buyer = memoryDb.buyers.find(b => b.email.toLowerCase().trim() === lookupEmail);
    if (!buyer) {
      return false;
    }

    buyer.password = hashedPassword;
    return true;
  },

  // ORDERS MANAGEMENT ENDPOINTS
  async getOrders(): Promise<DbOrder[]> {
    await connectToDatabase();
    if (isConnected && db) {
      const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
      return orders.map((o: any) => {
        const { _id, ...rest } = o;
        return rest as DbOrder;
      });
    }
    return [...memoryDb.orders].reverse();
  },

  async createOrder(order: DbOrder): Promise<boolean> {
    await connectToDatabase();
    
    // Decrement stock for purchased items
    for (const item of order.items) {
      const p = item.product;
      const q = item.quantity;
      await this.updateProduct(p.id, {
        specs: {
          ...p.specs,
          inStock: p.specs.inStock // maintain property or decrease quantity if added
        }
      });
    }

    if (isConnected && db) {
      await db.collection('orders').insertOne(JSON.parse(JSON.stringify(order)));
      return true;
    }
    memoryDb.orders.push(JSON.parse(JSON.stringify(order)));
    return true;
  },

  async updateOrderStatus(id: string, status: 'Pending' | 'Approved' | 'Dispatched' | 'Completed'): Promise<boolean> {
    await connectToDatabase();
    if (isConnected && db) {
      await db.collection('orders').updateOne({ id }, { $set: { status } });
      return true;
    }
    const order = memoryDb.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      return true;
    }
    return false;
  }
};
