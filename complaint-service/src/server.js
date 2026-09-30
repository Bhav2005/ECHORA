const app = require('./app');
const path = require('path');
const { initDb } = require('./db/complaintDb');
const startSlaWatchdog = require('./jobs/slaWatchdog.cron');
const startCorrelationEngine = require('./jobs/correlationEngine.cron');

const PORT = process.env.PORT || 3002;
const uploadsPath = path.join(__dirname, '../uploads');

const startServer = async () => {
  try {
    await initDb();
    
    // Start background cron watchdogs
    startSlaWatchdog();
    startCorrelationEngine();

    app.listen(PORT, () => {
      console.log(`Complaint Service running on port ${PORT}`);
      console.log(`Evidence files served from: ${uploadsPath}`);
    });
  } catch (error) {
    console.error('Failed to start Complaint Service:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;

