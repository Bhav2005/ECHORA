const cron = require('node-cron');
const { pool } = require('../db/complaintDb');

// SLA watches PENDING complaints older than 48 hours (or 5 minutes in development for demonstration)
const startSlaWatchdog = () => {
  // Run every 5 minutes in development, or every hour in production
  const schedule = process.env.NODE_ENV === 'development' ? '*/5 * * * *' : '0 * * * *';
  
  cron.schedule(schedule, async () => {
    console.log('[SLA Watchdog] Checking for complaints that breached SLA...');
    
    const interval = process.env.NODE_ENV === 'development' ? '5 minutes' : '48 hours';
    
    try {
      const result = await pool.query(
        `UPDATE complaints 
         SET status = 'ESCALATED' 
         WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '${interval}'
         RETURNING id`
      );

      if (result.rows.length > 0) {
        console.log(`[SLA Watchdog] Escalated ${result.rows.length} complaints due to SLA breaches:`, result.rows.map(r => r.id));
      } else {
        console.log('[SLA Watchdog] No complaints breached SLA.');
      }
    } catch (error) {
      console.error('[SLA Watchdog] Error running watchdog job:', error);
    }
  });
};

module.exports = startSlaWatchdog;
