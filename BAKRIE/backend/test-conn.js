const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Testing with:');
console.log('USER:', process.env.DB_USER);
console.log('PASS:', process.env.DB_PASS);
console.log('HOST:', process.env.DB_HOST);
console.log('NAME:', process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: 1433,
    dialect: 'mssql',
    logging: console.log,
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
    console.log('CONNECTION OK');
    process.exit(0);
  })
  .catch(e => {
    console.error('CONNECTION FAIL:', e);
    process.exit(1);
  });
