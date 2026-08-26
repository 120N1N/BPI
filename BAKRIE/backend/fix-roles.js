const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('BakrieHelpdesk', 'sa', 'YourStrongPassword123!', { 
  host: 'localhost', 
  dialect: 'mssql', 
  logging: false,
  dialectOptions: { options: { encrypt: false, trustServerCertificate: true } }
});

async function fixRoles() {
  try {
    const users = await sequelize.query('SELECT id, name, department_id FROM Users', { type: Sequelize.QueryTypes.SELECT });
    for (const u of users) {
      let role = 'user';
      if (u.name === 'Darrel') role = 'admin';
      else if (['Sutrisno', 'Bambang', 'Widodo', 'Haryanto', 'Kusuma'].includes(u.name)) role = 'admin_dept';
      else if (['Budi', 'Agus', 'Cahya', 'Dina', 'Eko', 'Fajar', 'Gilang', 'Hadi', 'Iwan', 'Joko', 'Kiki', 'Lina', 'Maya', 'Nina', 'Opie', 'Raka', 'Sita', 'Tomi'].includes(u.name)) role = 'staff';

      // Check if role exists
      const existing = await sequelize.query(`SELECT id FROM UserRoles WHERE user_id = '${u.id}'`, { type: Sequelize.QueryTypes.SELECT });
      if (existing.length === 0) {
        await sequelize.query(`INSERT INTO UserRoles (id, user_id, role, department_id, createdAt, updatedAt) VALUES (NEWID(), '${u.id}', '${role}', '${u.department_id}', GETDATE(), GETDATE())`);
      } else {
        await sequelize.query(`UPDATE UserRoles SET role = '${role}' WHERE user_id = '${u.id}'`);
      }
    }
    console.log('Fixed Roles');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
fixRoles();
