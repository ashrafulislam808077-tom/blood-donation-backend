const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ১. CORS কনফিগারেশন
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

// Express v5 / Path-to-Regexp compatible wildcard preflight
app.options('/(.*)/', cors());

// ২. Body Parser Middleware
app.use(express.json());

// ৩. টেস্ট রুট
app.get('/', (req, res) => {
  res.send('Blood Donation Backend Server is Running!');
});

// ৪. আপনার API Routes
app.get('/api/donors', (req, res) => {
  res.json({ message: "Donors route working" });
});

app.get('/api/requests', (req, res) => {
  res.json({ message: "Requests route working" });
});

// ৫. 404 রুট হ্যান্ডলার
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Route Not Found" });
});

// ৬. সার্ভার লিসেনিং
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});