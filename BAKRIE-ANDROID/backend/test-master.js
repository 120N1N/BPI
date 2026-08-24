const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'master',
  'sa',
  'YourStrongPassword123!',
  {
    host: 'localhost',
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
    console.log('OK MASTER');
    process.exit(0);
  })
  .catch(e => {
    console.error('FAIL MASTER:', e.message);
    process.exit(1);
  });
