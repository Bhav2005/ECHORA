const cron = require('node-cron');
const { pool } = require('../db/complaintDb');

const startCorrelationEngine = () => {
  // Run every 10 minutes in development, or daily/hourly in production
  const schedule = process.env.NODE_ENV === 'development' ? '*/10 * * * *' : '0 0 * * *';

  cron.schedule(schedule, async () => {
    console.log('[Correlation Engine] Searching for complaint spikes and patterns...');

    try {
      // Find departments with 3+ complaints in the last 24 hours
      const deptResult = await pool.query(
        `SELECT department, COUNT(*) as count 
         FROM complaints 
         WHERE created_at > NOW() - INTERVAL '24 hours' 
         GROUP BY department 
         HAVING COUNT(*) >= 3`
      );

      // Find buildings with 3+ complaints in the last 24 hours
      const bldResult = await pool.query(
        `SELECT building, COUNT(*) as count 
         FROM complaints 
         WHERE created_at > NOW() - INTERVAL '24 hours' 
         GROUP BY building 
         HAVING COUNT(*) >= 3`
      );

      if (deptResult.rows.length > 0) {
        console.warn(`\n[ALERT] [Correlation Engine] Active spikes detected in departments:`);
        deptResult.rows.forEach(r => {
          console.warn(`  - Department '${r.department}': ${r.count} complaints in last 24h`);
        });
      }

      if (bldResult.rows.length > 0) {
        console.warn(`\n[ALERT] [Correlation Engine] Active spikes detected in buildings:`);
        bldResult.rows.forEach(r => {
          console.warn(`  - Building '${r.building}': ${r.count} complaints in last 24h`);
        });
      }

      if (deptResult.rows.length === 0 && bldResult.rows.length === 0) {
        console.log('[Correlation Engine] No unusual spikes or correlation patterns detected.');
      }
    } catch (error) {
      console.error('[Correlation Engine] Error running correlation pattern matcher:', error);
    }
  });
};

module.exports = startCorrelationEngine;
