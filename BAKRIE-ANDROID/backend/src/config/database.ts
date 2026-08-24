import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'BakrieHelpdesk',
  process.env.DB_USER || 'sa',
  process.env.DB_PASS || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: 1433,
    dialect: 'mssql', // Using tedious for MS SQL
    logging: false, // Set to console.log to see SQL queries
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }
  }
);

export default sequelize;
