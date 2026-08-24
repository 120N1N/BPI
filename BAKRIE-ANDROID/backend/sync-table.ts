import dotenv from 'dotenv';
dotenv.config();
import sequelize from './src/config/database'; 
import { TicketHistory, Department, Ticket, User, Survey, UserRole, Evidence, Company } from './src/models'; 

async function syncDB() { 
  try { 
    await sequelize.authenticate(); 
    console.log('Syncing all tables without alter to ensure they exist...');
    await sequelize.sync(); 
    console.log('Tables created if not exist.'); 
    process.exit(0); 
  } catch(e) { 
    console.error(e); 
    process.exit(1); 
  } 
} 
syncDB();
