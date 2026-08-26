const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('BakrieHelpdesk', 'sa', 'YourStrongPassword123!', {
  host: 'localhost',
  dialect: 'mssql',
  logging: false,
});

async function resetDB() {
  try {
    console.log('Authenticating...');
    await sequelize.authenticate();
    console.log('Dropping and recreating all tables...');
    await sequelize.query(`
      EXEC sp_MSforeachtable @command1 = "DROP TABLE ?"
    `);
    console.log('Tables dropped successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetDB();
