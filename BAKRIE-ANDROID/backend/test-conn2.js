const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS.trim(),
  {
    host: process.env.DB_HOST || 'localhost',
    port: 1433,
    dialect: 'mssql',
    logging: false,
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('CONNECTION OK WITH TRIMMED PASSWORD');
    process.exit(0);
  })
  .catch(e => {
    console.error('CONNECTION FAIL:', e);
    process.exit(1);
  });
