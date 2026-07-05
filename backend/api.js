const { getDb, createId } = require('./database/db');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

async function saveRecord(collectionName, payload) {
  const db = getDb();
  if (db) {
    const result = await db.collection(collectionName).insertOne(payload);
    return { ...payload, _id: result.insertedId };
  }
  return { ...payload, _id: payload._id || createId() };
}

async function findRecords(collectionName, filter = {}) {
  const db = getDb();
  if (db) {
    return db.collection(collectionName).find(filter).toArray();
  }
  return [];
}

async function findOneRecord(collectionName, filter) {
  const db = getDb();
  if (db) {
    return db.collection(collectionName).findOne(filter);
  }
  return null;
}

async function handleApiRequest(req, res) {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const segments = requestUrl.pathname.split('/').filter(Boolean);

    if (segments[0] !== 'api') {
      return sendJson(res, 404, { success: false, message: 'API route not found' });
    }

    if (segments[1] === 'auth' && req.method === 'POST' && segments[2] === 'register') {
      const body = await parseJsonBody(req);
      const mobile = body.mobile;
      if (!mobile) {
        return sendJson(res, 400, { success: false, message: 'Mobile is required' });
      }

      const existingUser = await findOneRecord('users', { mobile });
      if (existingUser) {
        return sendJson(res, 200, { success: true, message: 'User already exists', profile: existingUser });
      }

      const profile = {
        _id: createId(),
        name: body.name,
        mobile,
        mobileNumber: mobile,
        verified: false,
        emergencyContacts: [],
        createdAt: new Date().toISOString()
      };
      await saveRecord('users', profile);
      return sendJson(res, 201, { success: true, message: 'Registration successful', profile });
    }

    if (segments[1] === 'auth' && req.method === 'GET' && segments[2] === 'profile') {
      const mobile = segments[3];
      const user = await findOneRecord('users', { mobile });
      if (!user) return sendJson(res, 404, { success: false, message: 'User not found' });
      return sendJson(res, 200, { success: true, user });
    }

    if (segments[1] === 'sos' && req.method === 'POST' && segments[2] === 'trigger') {
      const body = await parseJsonBody(req);
      const alert = {
        _id: createId(),
        userId: body.userId || 'anonymous',
        status: 'active',
        location: body.location || 'Unknown',
        createdAt: new Date().toISOString()
      };
      await saveRecord('sos_alerts', alert);
      return sendJson(res, 201, { success: true, alert });
    }

    if (segments[1] === 'services' && req.method === 'GET' && segments[2] === 'all') {
      const services = await findRecords('services', {});
      return sendJson(res, 200, { success: true, services });
    }

    return sendJson(res, 404, { success: false, message: 'Route not found' });
  } catch (error) {
    console.error('API error:', error.message);
    return sendJson(res, 500, { success: false, message: error.message });
  }
}

module.exports = { handleApiRequest };
