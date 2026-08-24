const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('BakrieHelpdesk', 'sa', 'YourStrongPassword123!', {
  host: 'localhost',
  dialect: 'mssql',
  logging: false,
});

async function run() {
  try {
    await sequelize.authenticate();
    const [users] = await sequelize.query('SELECT id, name, email, company_id FROM Users WHERE name LIKE \'%Penguji%\'');
    console.log('--- USERS ---');
    console.table(users);

    const [tickets] = await sequelize.query('SELECT id, title, created_by, company_id FROM Tickets');
    console.log('--- TICKETS ---');
    console.table(tickets);

  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}
run();
