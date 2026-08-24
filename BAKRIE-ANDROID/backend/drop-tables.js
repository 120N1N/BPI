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
    console.log('Disabling foreign keys and dropping tables...');
    
    // In MSSQL, we can't easily drop all tables if there are foreign keys without dropping FKs first
    // An easier way is to just drop the tables in specific order, or drop all constraints then tables.
    await sequelize.query(`
      WHILE(EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_TYPE = 'FOREIGN KEY'))
      BEGIN
          DECLARE @sql NVARCHAR(2000)
          SELECT TOP 1 @sql=('ALTER TABLE ' + TABLE_SCHEMA + '.[' + TABLE_NAME + '] DROP CONSTRAINT [' + CONSTRAINT_NAME + ']')
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
          WHERE CONSTRAINT_TYPE = 'FOREIGN KEY'
          EXEC(@sql)
      END
    `);

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
