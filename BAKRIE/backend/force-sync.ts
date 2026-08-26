import dotenv from 'dotenv';
dotenv.config();
import sequelize from './src/config/database'; 
import { TicketHistory, Department, Ticket, User, Survey, UserRole, Evidence, Company } from './src/models'; 

async function syncDB() { 
  try { 
    await sequelize.authenticate(); 
    console.log('Force syncing tables...');
    await sequelize.sync({ force: true }); 
    console.log('Tables dropped and recreated.'); 
    process.exit(0); 
  } catch(e) { 
    console.error(e); 
    process.exit(1); 
  } 
} 
syncDB();
