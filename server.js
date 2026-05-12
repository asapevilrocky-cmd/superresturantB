const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  })
});

let fcmTokens = {};

app.post('/register-token', (req, res) => {
  const { token, phone } = req.body;
  fcmTokens[phone] = token;
  res.json({ success: true });
});

app.post('/send-notification', async (req, res) => {
  const { token, title, body, tokens } = req.body;
  try {
    // If tokens array provided (broadcast)
    if (tokens && Array.isArray(tokens)) {
      const messages = tokens.map(t => ({
        token: t,
        notification: { title, body },
        android: { notification: { channelId: 'superburger', title, body } }
      }));
      const result = await admin.messaging().sendAll(messages);
      return res.json({ success: true, sent: result.successCount });
    }
    // Single token (old method)
    if (!token) return res.json({ success: false });
    await admin.messaging().send({
      token: token,
      notification: { title, body },
      android: { notification: { channelId: 'superburger', title, body } }
    });
    res.json({ success: true });
  } catch (e) {
    console.log('Notification error:', e.message);
    res.json({ success: false, error: e.message });
  }
});

app.listen(3000, () => console.log('Server running!'));
