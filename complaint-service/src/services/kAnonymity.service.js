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

module.exports = {
  getDepartmentStats,
  getBuildingStats,
  getCategoryStats,
  getHeatmapData,
  K_THRESHOLD,
};
