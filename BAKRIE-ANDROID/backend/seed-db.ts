import dotenv from 'dotenv';
dotenv.config();
import sequelize from './src/config/database'; 
import { Department, Company, User, UserRole } from './src/models'; 
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seedDB() { 
  try { 
    await sequelize.authenticate(); 
    console.log('Force syncing tables...');
    await sequelize.sync({ force: true }); 
    console.log('Tables recreated.');
    
    const companyId = uuidv4();
    await Company.create({
      id: companyId, code: 'BPI', name: 'Bakrie Pipe Industries', slug: 'bakrie-pipe-industries', domain: 'Bakrie Pipe Industries', timezone: 'Asia/Jakarta', is_active: true
    } as any);

    const depts = [
      { id: uuidv4(), name: 'IT Infrastruktur', code: 'IT-INF' },
      { id: uuidv4(), name: 'IT System', code: 'IT-SYS' },
      { id: uuidv4(), name: 'Maintenance', code: 'MNT' },
      { id: uuidv4(), name: 'General Affair', code: 'GA' },
      { id: uuidv4(), name: 'Human Resources', code: 'HR' },
      { id: uuidv4(), name: 'Direksi', code: 'DIR' }
    ];

    for (const d of depts) {
      await Department.create({
        id: d.id, company_id: companyId, name: d.name, code: d.code, description: `Departemen ${d.name}`, is_active: true
      } as any);
    }

    const passwordHash = await bcrypt.hash('1234', 10);
    let nipCounter = 1000;
    const adminDeptNames = ['Sutrisno', 'Bambang', 'Widodo', 'Haryanto', 'Kusuma', 'Ahmad'];
    const staffNames = [
      ['Budi', 'Agus', 'Cahya'],         // IT Infra
      ['Dina', 'Eko', 'Fajar'],          // IT System
      ['Gilang', 'Hadi', 'Iwan'],        // Maintenance
      ['Joko', 'Kiki', 'Lina'],          // GA
      ['Maya', 'Nina', 'Opie'],          // HR
      ['Raka', 'Sita', 'Tomi']           // Direksi (Staff Administrasi)
    ];

    // 1. SUPER ADMIN
    const adminId = uuidv4();
    const superAdminNip = nipCounter.toString(); nipCounter++;
    await User.create({ id: adminId, company_id: companyId, department_id: depts[1].id, name: 'Darrel', email: superAdminNip, password_hash: passwordHash, is_active: true } as any);
    await UserRole.create({ id: uuidv4(), user_id: adminId, role: 'admin', department_id: depts[1].id } as any);
    
    // 2. ADMIN DEPT
    for (let d = 0; d < depts.length - 1; d++) {
      const adminDeptId = uuidv4();
      const nip = nipCounter.toString(); nipCounter++;
      await User.create({ id: adminDeptId, company_id: companyId, department_id: depts[d].id, name: adminDeptNames[d], email: nip, password_hash: passwordHash, is_active: true } as any);
      await UserRole.create({ id: uuidv4(), user_id: adminDeptId, role: 'admin_dept', department_id: depts[d].id } as any);
    }

    // 3. STAFF
    for (let d = 0; d < depts.length - 1; d++) {
      for (let i = 0; i < 3; i++) {
        const staffId = uuidv4();
        const nip = nipCounter.toString(); nipCounter++;
        await User.create({ id: staffId, company_id: companyId, department_id: depts[d].id, name: staffNames[d][i], email: nip, password_hash: passwordHash, is_active: true } as any);
        await UserRole.create({ id: uuidv4(), user_id: staffId, role: 'staff', department_id: depts[d].id } as any);
      }
    }
    
    // 4. KARYAWAN BIASA
    const regularNames = ['Putra', 'Qori', 'Rizky'];
    for (let i = 0; i < 3; i++) {
      const userId = uuidv4();
      const nip = nipCounter.toString(); nipCounter++;
      await User.create({ id: userId, company_id: companyId, department_id: depts[4].id, name: regularNames[i], email: nip, password_hash: passwordHash, is_active: true } as any);
      await UserRole.create({ id: uuidv4(), user_id: userId, role: 'user', department_id: depts[4].id } as any);
    }

    // 5. TEST USER KHUSUS (0000)
    const testUserId = uuidv4();
    await User.create({ id: testUserId, company_id: companyId, department_id: depts[5].id, name: 'Penguji Khusus', email: '0000', password_hash: passwordHash, is_active: true } as any);
    await UserRole.create({ id: uuidv4(), user_id: testUserId, role: 'user', department_id: depts[5].id } as any);

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch(e) { 
    console.error(e); 
    process.exit(1); 
  } 
} 
seedDB();
