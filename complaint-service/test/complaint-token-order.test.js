const test = require('node:test');
const assert = require('node:assert/strict');

const complaintDbPath = require.resolve('../src/db/complaintDb');
const hashChainPath = require.resolve('../src/services/hashChain.service');
const evidenceUploadPath = require.resolve('../src/services/evidenceUpload.service');
const complaintControllerPath = require.resolve('../src/controllers/complaint.controller');

test('submitComplaint marks used token only after complaint insert succeeds', async () => {
  const dbModule = require('../src/db/complaintDb');
  const hashChain = require('../src/services/hashChain.service');
  const evidenceUpload = require('../src/services/evidenceUpload.service');

  const callOrder = [];
  const client = {
    query: async (sql) => {
      if (sql.includes('INSERT INTO used_tokens')) {
        callOrder.push('used_tokens');
      }
      if (sql.includes('INSERT INTO complaints')) {
        callOrder.push('complaints');
      }
      if (sql.includes('COMMIT')) {
        return { rows: [] };
      }
      return { rows: [] };
    },
    release: () => {},
  };

  dbModule.pool = { connect: async () => client };
  hashChain.getLatestBlockHash = async () => 'previous-hash';
  hashChain.calculateHash = () => 'block-hash';
  evidenceUpload.processUpload = async () => '/uploads/test.jpg';

  delete require.cache[complaintControllerPath];
  const { submitComplaint } = require('../src/controllers/complaint.controller');

  const req = {
    body: {
      category: 'Facilities & Maintenance',
      department: 'IT Services',
      building: 'Main Building',
      content: 'Test complaint',
      tokenMessage: 'abc123',
      tokenSignature: 'def456',
      mailboxId: 'box_1234',
    },
    file: null,
    tokenHash: 'hash-123',
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await submitComplaint(req, res);

  assert.deepEqual(callOrder, ['complaints', 'used_tokens']);
  assert.equal(res.statusCode, 201);
});
