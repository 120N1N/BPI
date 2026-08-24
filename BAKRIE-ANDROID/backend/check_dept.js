const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('BakrieHelpdesk', 'sa', 'YourStrongPassword123!', {
  host: 'localhost',
  dialect: 'mssql',
  logging: false,
});

async function getDepartments() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query('SELECT name FROM Departments');
    console.log('\n=== DAFTAR DEPARTEMEN YANG VALID DI DATABASE KAMU ===');
    if (results.length === 0) {
      console.log('TIDAK ADA DEPARTEMEN! Tabel kosong.');
    } else {
      results.forEach((row, i) => console.log(`${i + 1}. "${row.name}"`));
    }
    console.log('======================================================\n');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

getDepartments();
