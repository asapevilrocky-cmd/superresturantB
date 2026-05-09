const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  })
});

let fcmTokens = {};

app.post('/register-token', (req, res) => {
  const { token, phone } = req.body;
  fcmTokens[phone] = token;
  res.json({ success: true });
});

app.post('/send-notification', async (req, res) => {
  const { phone, title, body } = req.body;
  try {
    const token = fcmTokens[phone];
    if (!token) return res.json({ success: false });
    await admin.messaging().send({
      token: token,
      notification: { title, body },
      android: { notification: { channelId: 'superburger', title, body } }
    });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

app.listen(3000, () => console.log('Server running!'));