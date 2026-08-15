const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDb } = require('./db/identityDb');
const otpRoutes = require('./routes/otp.routes');
const blindSignRoutes = require('./routes/blindsign.routes');
const { otpLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'identity-service' });
});

// Routes
app.use('/api/otp', otpLimiter, otpRoutes);
app.use('/api/blindsign', blindSignRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Identity Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Identity Service:', error);
    process.exit(1);
  }
};

startServer();
