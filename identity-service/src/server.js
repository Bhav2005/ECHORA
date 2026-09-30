const app = require('./app');
const { initDb } = require('./db/identityDb');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Identity Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Identity Service:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;

