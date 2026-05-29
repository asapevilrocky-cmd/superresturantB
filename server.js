require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

process.on('uncaughtException', (e) => { console.log('💥 Uncaught:', e.message, e.stack); setTimeout(() => process.exit(1), 1000); });
process.on('unhandledRejection', (e) => { console.log('💥 Unhandled rejection:', e.message, e.stack); });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM || '+16507896851';

async function sendTwilioSms(to, text) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('⚠️ Twilio credentials not configured');
    return { status: 500, body: 'Twilio not configured' };
  }
  const https = require('https');
  const qs = require('querystring');
  const auth = Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64');
  let normalized = to.startsWith('+') ? to : '+' + to;
  const data = qs.stringify({ From: TWILIO_FROM, To: normalized, Body: text });
  console.log('📤 Sending Twilio SMS:', { from: TWILIO_FROM, to: normalized });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.twilio.com', port: 443,
      path: '/2010-04-01/Accounts/' + TWILIO_ACCOUNT_SID + '/Messages.json',
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log('📨 Twilio status:', res.statusCode, 'body:', body.substring(0, 300));
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', (e) => { console.log('❌ Twilio error:', e.message); resolve({ status: 500, body: e.message }); });
    req.write(data);
    req.end();
  });
}

const app = express();
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log('🌐', req.method, req.path);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

let db = null;

const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY || '';
if (FIREBASE_PRIVATE_KEY) {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID || 'superburger-2570b',
    client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@superburger-2570b.iam.gserviceaccount.com',
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  };
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('Firebase initialized successfully');
  } catch(e) {
    console.log('Firebase init error:', e.message);
  }
} else {
  console.log('⚠️ FIREBASE_PRIVATE_KEY not set, Firebase disabled');
}

app.get('/', (req, res) => res.json({ status: 'running', endpoints: ['/send-otp', '/verify-otp', '/send-notification', '/register-token'] }));

app.get('/delete-account', (req, res) => {
  res.send(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>حذف الحساب</title><style>body{font-family:sans-serif;background:#111;color:#fff;max-width:600px;margin:50px auto;padding:20px;line-height:1.8}h1{color:#d4a54a}a{color:#d4a54a}</style></head><body><h1>حذف الحساب - سوبر برجر</h1><p>لحذف حسابك وبياناتك الشخصية نهائياً من تطبيق سوبر برجر، يرجى التواصل عبر واتساب:</p><p><a href="https://wa.me/970593221500">📱 واتساب: 0593221500</a></p><p>سيتم حذف الحساب وجميع البيانات خلال 7 أيام عمل.</p></body></html>`);
});

app.post('/register-token', async (req, res) => {
  const { token, phone } = req.body;
  if (!db) return res.json({ success: false, error: 'Firebase not configured' });
  try {
    await db.collection('fcmTokens').doc(phone).set({ token, updatedAt: new Date() });
    res.json({ success: true });
  } catch(e) {
    console.log('Error saving token:', e.message);
    res.json({ success: false, error: e.message });
  }
});

app.post('/send-notification', async (req, res) => {
  const { phone, token, title, body, tokens } = req.body;
  if (!db) return res.json({ success: false, error: 'Firebase not configured' });
  try {
    if (tokens && Array.isArray(tokens)) {
      const messages = tokens.map(t => ({
        token: t,
        notification: { title, body },
        android: { notification: { title, body } }
      }));
      const result = await admin.messaging().sendAll(messages);
      return res.json({ success: true, sent: result.successCount });
    }
    let fcmToken = token;
    if (!fcmToken && phone) {
      let tokenDoc = await db.collection('fcmTokens').doc(phone).get();
      if (tokenDoc.exists) {
        fcmToken = tokenDoc.data().token;
      } else {
        const normalizedPhone = phone.startsWith('0') ? '970' + phone.slice(1) : phone;
        tokenDoc = await db.collection('fcmTokens').doc(normalizedPhone).get();
        if (tokenDoc.exists) {
          fcmToken = tokenDoc.data().token;
        }
      }
    }
    if (!fcmToken) return res.json({ success: false, error: 'No token found' });
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      android: { notification: { title, body } }
    });
    res.json({ success: true });
  } catch (e) {
    console.log('Notification error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

// In-memory rate limiting: phone -> { count, firstRequest }
const otpRateMap = new Map();
const ATTEMPT_LIMIT = 3; // max failed attempts per code

function normalizePhone(num) {
  if (!num) return '';
  let n = num.replace(/[^0-9+]/g, '');
  if (n.startsWith('+')) return n;
  if (n.startsWith('00')) return '+' + n.slice(2);
  if (n.startsWith('0')) return '+970' + n.slice(1);
  return '+970' + n;
}

app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.json({ success: false, error: 'رقم الهاتف مطلوب' });
  if (!db) return res.json({ success: false, error: 'Firebase not configured' });

  const normalized = normalizePhone(phone);
  if (normalized.length < 10) {
    return res.json({ success: false, error: 'رقم الهاتف غير صحيح' });
  }

  // Rate limiting: max 3 OTP requests per 5 minutes per phone
  const now = Date.now();
  const entry = otpRateMap.get(normalized);
  if (entry) {
    if (now - entry.firstRequest < 5 * 60 * 1000) {
      if (entry.count >= 3) {
        const retryAfter = Math.ceil((5 * 60 * 1000 - (now - entry.firstRequest)) / 1000 / 60);
        return res.json({ success: false, error: `طلبات كثيرة، حاول بعد ${retryAfter} دقائق` });
      }
      entry.count++;
    } else {
      otpRateMap.set(normalized, { count: 1, firstRequest: now });
    }
  } else {
    otpRateMap.set(normalized, { count: 1, firstRequest: now });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await db.collection('otpCodes').doc(normalized).set({
      code,
      expiresAt,
      createdAt: new Date(),
      attempts: 0
    });
    console.log('🔑 OTP stored for', normalized, ':', code);

    const text = `كود التحقق الخاص بك: ${code}\nصلاحية الكود 5 دقائق - سوبر برجر`;
    const result = await sendTwilioSms(normalized, text);

    if (result.status !== 200 && result.status !== 201) {
      console.log('❌ Twilio error details:', result.body);
      let errMsg = 'فشل إرسال SMS';
      try { const b = JSON.parse(result.body); if (b.message) errMsg += ': ' + b.message; } catch(e) {}
      return res.json({ success: false, error: errMsg });
    }
    res.json({ success: true });
  } catch(e) {
    console.log('❌ Send OTP error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.json({ success: false, error: 'البيانات ناقصة' });
  if (!db) return res.json({ success: false, error: 'Firebase not configured' });

  const normalized = normalizePhone(phone);

  try {
    const docRef = db.collection('otpCodes').doc(normalized);
    const doc = await docRef.get();
    if (!doc.exists) return res.json({ success: false, error: 'لم يتم إرسال كود لهذا الرقم' });

    const data = doc.data();

    // Attempt limiting: max 5 failed attempts
    if (data.attempts >= ATTEMPT_LIMIT) {
      await docRef.delete();
      return res.json({ success: false, error: 'محاولات كثيرة فاشلة، أعد إرسال الكود' });
    }

    if (Date.now() > data.expiresAt) {
      await docRef.delete();
      return res.json({ success: false, error: 'انتهت صلاحية الكود' });
    }

    if (data.code !== code) {
      await docRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
      const remaining = ATTEMPT_LIMIT - (data.attempts + 1);
      return res.json({ success: false, error: remaining > 0 ? `الكود غير صحيح، لديك ${remaining} محاولات` : 'الكود غير صحيح' });
    }

    await docRef.delete();
    res.json({ success: true });
  } catch(e) {
    console.log('Verify OTP error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

app.post('/place-order', async (req, res) => {
  const { userId, name, phone, fcmToken, items, couponId } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.json({ success: false, error: 'السلة فارغة' });
  }
  if (!db) return res.json({ success: false, error: 'Firebase not configured' });

  try {
    // Fetch current menu prices from Firestore
    const menuSnap = await db.collection('menu').get();
    const menuMap = {};
    menuSnap.docs.forEach(d => { const d2 = d.data(); menuMap[d2.name] = d2.price; });

    // Also consider the built-in menuData from the client fallback
    // Validate each item's price server-side
    let serverTotal = 0;
    const validatedItems = [];
    for (const item of items) {
      const menuPrice = menuMap[item.name];
      const basePrice = menuPrice !== undefined ? menuPrice : (item.price || 0);
      const optionsTotal = (item.selectedOptions || []).reduce((s, o) => s + (o.price || 0), 0);
      const finalPrice = basePrice + optionsTotal;
      serverTotal += finalPrice;
      validatedItems.push({
        name: item.name,
        price: basePrice,
        finalPrice,
        selectedOptions: item.selectedOptions || []
      });
    }

    // Apply coupon if provided
    let appliedDiscount = 0;
    let finalCouponId = null;
    if (couponId) {
      const couponDoc = await db.collection('coupons').doc(couponId).get();
      if (couponDoc.exists) {
        const couponData = couponDoc.data();
        if (couponData.active !== false) {
          if (!couponData.expiresAt || new Date(couponData.expiresAt) >= new Date()) {
            if (!couponData.maxUses || (couponData.currentUses || 0) < couponData.maxUses) {
              // Check per-user limit
              if (couponData.maxPerUser > 0 && userId) {
                const userCount = (couponData.usedBy && couponData.usedBy[userId]) || 0;
                if (userCount >= couponData.maxPerUser) {
                  return res.json({ success: false, error: 'لقد استنفذت حد استخدام هذا الكوبون' });
                }
              }
              appliedDiscount = couponData.discount || 0;
              finalCouponId = couponId;
            }
          }
        }
      }
    }

    const finalTotal = appliedDiscount > 0
      ? Math.round(serverTotal * (100 - appliedDiscount) / 100)
      : serverTotal;

    const orderRef = await db.collection('orders').add({
      userId: userId || null,
      userName: name || 'ضيف',
      name: name || 'ضيف',
      phone: phone || '00000000',
      fcmToken: fcmToken || null,
      deliveryLocation: '',
      orderType: 'pickup',
      items: validatedItems,
      total: finalTotal,
      serverTotal,
      discount: appliedDiscount,
      couponId: finalCouponId,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Increment coupon usage
    if (finalCouponId) {
      try {
        const updateData = {
          currentUses: admin.firestore.FieldValue.increment(1)
        };
        if (userId) {
          updateData[`usedBy.${userId}`] = admin.firestore.FieldValue.increment(1);
        }
        await db.collection('coupons').doc(finalCouponId).update(updateData);
      } catch(e) {
        console.log('Coupon increment error:', e.message);
      }
    }

    res.json({ success: true, orderId: orderRef.id, total: finalTotal });
  } catch(e) {
    console.log('Place order error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

app.post('/send-order-sms', async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.json({ success: false, error: 'رقم الهاتف مطلوب' });
  try {
    const text = `مرحباً ${name || 'عميلنا'}! 🍔\nتم استلام طلبك الأول من سوبر برجر!\nسيتم تجهيزه قريباً.\nشكراً لثقتك ❤️`;
    const result = await sendTwilioSms(phone, text);
    res.json({ success: result.status === 200 || result.status === 201 });
  } catch(e) {
    console.log('❌ Twilio SMS error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));
