const request = require('supertest');
const app = require('../../src/app');

describe('Identity Service Integration Tests - Health API', () => {
  it('GET /health should return 200 OK with UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      status: 'UP',
      service: 'identity-service',
    });
  });
});
