const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

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
        android: { notification: { channelId: 'superburger', title, body } }
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
      android: { notification: { channelId: 'superburger', title, body } }
    });
    res.json({ success: true });
  } catch (e) {
    console.log('Notification error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  console.log('📩 /send-otp called for:', phone);
  if (!phone) return res.json({ success: false, error: 'رقم الهاتف مطلوب' });
  if (!db) return res.json({ success: false, error: 'Firebase not configured' });
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await db.collection('otpCodes').doc(phone).set({ code, expiresAt, createdAt: new Date() });
    console.log('🔑 OTP stored:', code);

    const text = `كود التحقق الخاص بك: ${code}\nصلاحية الكود 5 دقائق - سوبر برجر`;
    const result = await sendVonageSms(phone, text);
    console.log('📨 Vonage response:', result.status, result.body);
    if (result.status !== 200) return res.json({ success: false, error: 'فشل إرسال SMS' });
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
  try {
    const doc = await db.collection('otpCodes').doc(phone).get();
    if (!doc.exists) return res.json({ success: false, error: 'لم يتم إرسال كود لهذا الرقم' });
    const data = doc.data();
    if (Date.now() > data.expiresAt) {
      await db.collection('otpCodes').doc(phone).delete();
      return res.json({ success: false, error: 'انتهت صلاحية الكود' });
    }
    if (data.code !== code) return res.json({ success: false, error: 'الكود غير صحيح' });
    await db.collection('otpCodes').doc(phone).delete();
    res.json({ success: true });
  } catch(e) {
    console.log('Verify OTP error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

// Vonage SMS setup
const VONAGE_API_KEY = process.env.VONAGE_API_KEY || '';
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET || '';
const VONAGE_FROM = process.env.VONAGE_FROM || 'SuperBurger';

async function sendVonageSms(to, text) {
  const https = require('https');
  let normalized = to.replace(/^\+/, '').replace(/[^0-9]/g, '');
  const data = JSON.stringify({ from: VONAGE_FROM, to: normalized, text });
  const auth = Buffer.from(`${VONAGE_API_KEY}:${VONAGE_API_SECRET}`).toString('base64');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'rest.nexmo.com',
      path: '/sms/json',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

app.post('/send-order-sms', async (req, res) => {
  const { phone, name } = req.body;
  console.log('📩 /send-order-sms called for:', phone);
  if (!phone) return res.json({ success: false, error: 'رقم الهاتف مطلوب' });
  try {
    const text = `مرحباً ${name || 'عميلنا'}! 🍔\nتم استلام طلبك الأول من سوبر برجر!\nسيتم تجهيزه قريباً.\nشكراً لثقتك ❤️`;
    const result = await sendVonageSms(phone, text);
    console.log('📨 Vonage response:', result.status, result.body);
    res.json({ success: result.status === 200 });
  } catch(e) {
    console.log('❌ Vonage SMS error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

app.listen(3000, () => console.log('Server running!'));
