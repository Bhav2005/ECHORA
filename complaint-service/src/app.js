const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

const complaintRoutes = require('./routes/complaint.routes');
const adminRoutes = require('./routes/admin.routes');
const adminOutcomeRoutes = require('./routes/adminOutcomeRoutes');
const dashboardRoutes = require('./routes/dashboard.routes');
const mailboxRoutes = require('./routes/mailbox.routes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static evidence uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'complaint-service' });
});

// Route Handlers
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminOutcomeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mailbox', mailboxRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

module.exports = app;
