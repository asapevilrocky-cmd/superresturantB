require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const twilio = require('twilio');

// Twilio setup using official SDK
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;
let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

async function sendTwilioSms(to, text) {
  if (!twilioClient) {
    console.log('⚠️ Twilio credentials not configured');
    return { status: 500, body: 'Twilio not configured' };
  }
  let normalized = to.startsWith('+') ? to : '+' + to;
  console.log('📤 Sending Twilio SMS:', { from: TWILIO_FROM, to: normalized, text: text.substring(0, 30) + '...' });
  try {
    const message = await twilioClient.messages.create({
      from: TWILIO_FROM,
      to: normalized,
      body: text
    });
    console.log('📨 Twilio success:', message.sid);
    return { status: 200, body: message.sid };
  } catch(e) {
    console.log('❌ Twilio error:', e.message);
    return { status: 500, body: e.message };
  }
}

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
      return res.json({ success: false, error: 'فشل إرسال SMS، تحقق من رقم الهاتف' });
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
app.listen(PORT, () => console.log('Server running on port ' + PORT));
