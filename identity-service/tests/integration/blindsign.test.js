const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/identityDb');

jest.mock('../../src/db/identityDb', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    pool: {
      connect: jest.fn().mockResolvedValue(mClient),
      query: jest.fn(),
    },
    mClient,
  };
});

describe('Identity Service Integration Tests - Blind Sign API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/blindsign/public-key should return RSA public key components', async () => {
    const res = await request(app).get('/api/blindsign/public-key');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('pem');
    expect(res.body).toHaveProperty('n');
    expect(res.body).toHaveProperty('e');
  });

  it('POST /api/blindsign/sign should return 401 if Authorization header is missing', async () => {
    const res = await request(app)
      .post('/api/blindsign/sign')
      .send({ blindedMessage: '1234abcd' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toContain('Authorization header is required');
  });

  it('POST /api/blindsign/sign should return 400 if blindedMessage is missing', async () => {
    const res = await request(app)
      .post('/api/blindsign/sign')
      .set('Authorization', 'Bearer valid-session-token')
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('blindedMessage is required');
  });
});
