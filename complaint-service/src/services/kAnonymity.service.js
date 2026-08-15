const { pool } = require('../db/complaintDb');

const K_THRESHOLD = 5;

const getDepartmentStats = async () => {
  const query = `
    SELECT department, COUNT(*)::integer as count
    FROM complaints
    GROUP BY department
    HAVING COUNT(*) >= $1
    ORDER BY count DESC
  `;
  const result = await pool.query(query, [K_THRESHOLD]);
  return result.rows;
};

const getBuildingStats = async () => {
  const query = `
    SELECT building, COUNT(*)::integer as count
    FROM complaints
    GROUP BY building
    HAVING COUNT(*) >= $1
    ORDER BY count DESC
  `;
  const result = await pool.query(query, [K_THRESHOLD]);
  return result.rows;
};

const getCategoryStats = async () => {
  const query = `
    SELECT category, COUNT(*)::integer as count
    FROM complaints
    GROUP BY category
    HAVING COUNT(*) >= $1
    ORDER BY count DESC
  `;
  const result = await pool.query(query, [K_THRESHOLD]);
  return result.rows;
};

const getHeatmapData = async () => {
  const query = `
    SELECT department, building, category, COUNT(*)::integer as count
    FROM complaints
    GROUP BY department, building, category
    HAVING COUNT(*) >= $1
    ORDER BY count DESC
  `;
  const result = await pool.query(query, [K_THRESHOLD]);
  return result.rows;
};

// Global totals — safe to publish as-is, since they're system-wide counts,
// not broken down into small groups that could be traced back to anyone.
const getPublicSummary = async () => {
  const query = `
    SELECT
      COUNT(*)::integer as total,
      COUNT(*) FILTER (WHERE status = 'RESOLVED')::integer as resolved
    FROM complaints
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

// Monthly volume, total only (not split by category/department, to avoid
// thin monthly x category cells that could approach identifying detail).
const getMonthlyVolume = async () => {
  const query = `
    SELECT
      to_char(date_trunc('month', created_at), 'Mon') as month,
      date_trunc('month', created_at) as month_start,
      COUNT(*)::integer as total,
      COUNT(*) FILTER (WHERE status = 'RESOLVED')::integer as resolved
    FROM complaints
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY date_trunc('month', created_at)
    ORDER BY month_start ASC
  `;
  const result = await pool.query(query);
  return result.rows.map(r => ({ month: r.month, total: r.total, resolved: r.resolved }));
};

module.exports = {
  getDepartmentStats,
  getBuildingStats,
  getCategoryStats,
  getHeatmapData,
  getPublicSummary,
  getMonthlyVolume,
  K_THRESHOLD,
};