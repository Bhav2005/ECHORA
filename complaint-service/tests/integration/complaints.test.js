const request = require('supertest');
const { pool } = require('../../src/db/complaintDb');

jest.mock('../../src/db/complaintDb', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

const app = require('../../src/app');

describe('Complaint Service Integration Tests - Complaints API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/complaints should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send({ category: 'Academic' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/complaints/:id should return 404 for nonexistent complaint ID', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).get(`/api/complaints/${fakeId}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      success: false,
      error: 'Complaint not found',
    });
  });
});
