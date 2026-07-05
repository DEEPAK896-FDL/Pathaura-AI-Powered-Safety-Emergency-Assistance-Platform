const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

let client = null;
let db = null;

const memoryStore = {
  government_schemes: [],
  crop_prices: [],
  weather_reports: [],
  marketplace_items: [],
  organic_fertilizers: []
};

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pathaura';

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      },
      retryWrites: true,
      w: 'majority'
    });

    await client.connect();
    db = client.db('pathaura');
    await ensureCollections();
    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.warn('MongoDB unavailable, using in-memory fallback:', error.message);
    return null;
  }
}

async function ensureCollections() {
  if (!db) return;

  const collections = ['government_schemes', 'crop_prices', 'weather_reports', 'marketplace_items', 'organic_fertilizers'];
  const existing = await db.listCollections().toArray();
  const existingNames = new Set(existing.map((item) => item.name));

  for (const name of collections) {
    if (!existingNames.has(name)) {
      await db.createCollection(name);
    }
  }
}

async function seedDefaults() {
  if (db) {
    const defaults = {
      government_schemes: [
        { title: 'PM-Kisan', description: 'Income support for small farmers', eligibility: 'Small and marginal farmers', benefits: ['₹6000/year'] },
        { title: 'Kisan Credit Card', description: 'Low-interest crop loans', eligibility: 'Farmers and cultivators', benefits: ['Lower interest rates'] }
      ],
      crop_prices: [
        { crop: 'Rice', market: 'Coimbatore', price: 2400, unit: 'per quintal', date: '2026-07-05' },
        { crop: 'Wheat', market: 'Chennai', price: 2150, unit: 'per quintal', date: '2026-07-05' }
      ],
      weather_reports: [
        { location: 'Coimbatore', temperature: 29, condition: 'Sunny', humidity: 68, forecast: 'Clear skies' },
        { location: 'Madurai', temperature: 31, condition: 'Cloudy', humidity: 72, forecast: 'Possible rain' }
      ],
      marketplace_items: [
        { title: 'Organic Seeds Pack', category: 'Seeds', price: 250, seller: 'Green Valley', stock: 20 },
        { title: 'Drip Irrigation Kit', category: 'Tools', price: 1800, seller: 'Agro Hub', stock: 8 }
      ],
      organic_fertilizers: [
        { name: 'Compost Mix', type: 'Organic', benefits: ['Improves soil structure'], price: 350 },
        { name: 'Vermicompost', type: 'Organic', benefits: ['Rich in nutrients'], price: 420 }
      ]
    };

    for (const [collectionName, items] of Object.entries(defaults)) {
      const count = await db.collection(collectionName).countDocuments();
      if (count === 0) {
        await db.collection(collectionName).insertMany(items);
      }
    }
    return;
  }

  for (const [collectionName, items] of Object.entries(memoryStore)) {
    if (memoryStore[collectionName].length === 0) {
      memoryStore[collectionName] = items.map((item) => ({ ...item, _id: createId(), createdAt: new Date().toISOString() }));
    }
  }
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDb() {
  return db;
}

function getMemoryStore() {
  return memoryStore;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectDB,
  closeDB,
  seedDefaults,
  getDb,
  getMemoryStore,
  createId,
  ObjectId
};
