const kAnonymityService = require('../services/kAnonymity.service');
const { pool } = require('../db/complaintDb');
const hashChainService = require('../services/hashChain.service');

const getStats = async (req, res) => {
  try {
    const departmentStats = await kAnonymityService.getDepartmentStats();
    const buildingStats = await kAnonymityService.getBuildingStats();
    const categoryStats = await kAnonymityService.getCategoryStats();

    return res.status(200).json({
      success: true,
      stats: {
        departments: departmentStats,
        buildings: buildingStats,
        categories: categoryStats,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
  }
};

const getHeatmap = async (req, res) => {
  try {
    const heatmapData = await kAnonymityService.getHeatmapData();
    return res.status(200).json({ success: true, heatmap: heatmapData });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch heatmap data' });
  }
};

const getComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, category, department, building, content, evidence_url, mailbox_id, status, previous_hash, block_hash, created_at FROM complaints ORDER BY created_at DESC'
    );
    
    // Verify blockchain chain integrity to display on admin dashboard
    const integrity = await hashChainService.verifyChainIntegrity();

    return res.status(200).json({
      success: true,
      complaints: result.rows,
      chainIntegrity: integrity
    });
  } catch (error) {
    console.error('Error fetching complaints list:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints list' });
  }
};

module.exports = {
  getStats,
  getHeatmap,
  getComplaints,
};
