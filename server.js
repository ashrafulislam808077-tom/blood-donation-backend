const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ১. CORS কনফিগারেশন (Netlify ফ্রন্টএন্ড অ্যাক্সেসের জন্য)
const allowedOrigins = [
  'https://juboshokti-blood-donation-app.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Preflight রিকোয়েস্ট হ্যান্ডেল করতে
app.options('*', cors());

// ২. Body Parser Middleware
app.use(express.json());

// ৩. টেস্ট রুট (সার্ভার রানিং কিনা দেখার জন্য)
app.get('/', (req, res) => {
  res.send('Blood Donation Backend Server is Running!');
});

// ৪. আপনার API Route সমূহ
// (আপনার রুট ফোল্ডার অনুযায়ী require path ঠিক করে নিবেন)
// উদাহরণ:
// const donorRoutes = require('./routes/donorRoutes');
// const requestRoutes = require('./routes/requestRoutes');

// app.use('/api/donors', donorRoutes);
// app.use('/api/requests', requestRoutes);

// ডেমো API (আপনার রাউট না থাকলে বোঝার জন্য):
app.get('/api/donors', (req, res) => {
  res.json({ message: "Donors route working" });
});

app.get('/api/requests', (req, res) => {
  res.json({ message: "Requests route working" });
});

// ৫. ৪০৪ রুট হ্যান্ডলার (ভুল লিংকে হিট করলে CORS হেডারসহ JSON রেসপন্স দিবে)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Route Not Found" });
});

// ৬. সার্ভার লিসেনিং
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});