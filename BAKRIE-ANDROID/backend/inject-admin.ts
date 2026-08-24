import dotenv from 'dotenv';
dotenv.config();
import sequelize from './src/config/database'; 
import { Department, Company, User, UserRole } from './src/models'; 
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function injectAdmin() { 
  try { 
    await sequelize.authenticate(); 
    console.log('Menyiapkan tabel dasar...');
    await sequelize.sync(); 
    
    // Cari atau buat company
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        id: uuidv4(),
        code: 'BPI',
        name: 'Bakrie Pipe',
        slug: 'bakrie-pipe',
        domain: 'bakrie',
        timezone: 'Asia/Jakarta'
      } as any);
      console.log('Berhasil membuat Company default.');
    }

    // Cari atau buat Department "IT Infrastruktur"
    const deptName = 'IT Infrastruktur';
    let dept = await Department.findOne({ where: { name: deptName } });
    if (!dept) {
      dept = await Department.create({
        id: uuidv4(),
        company_id: company.id,
        name: deptName,
        code: 'IT-INF',
        description: 'Testing',
        is_active: true
      } as any);
      console.log(`Berhasil membuat Departemen: ${deptName}`);
    }

    // Buat User "Sutrisno" (Admin Dept IT Infrastruktur) - NIP: 1001
    const nip = '1001';
    let user = await User.findOne({ where: { email: nip } });
    if (!user) {
      const passwordHash = await bcrypt.hash('1234', 10);
      user = await User.create({
        id: uuidv4(),
        company_id: company.id,
        department_id: dept.id,
        name: 'Sutrisno',
        email: nip,
        password_hash: passwordHash,
        is_active: true
      } as any);
      console.log(`Berhasil membuat Akun: Sutrisno (NIP: ${nip})`);

      // Berikan Role "admin_dept"
      await UserRole.create({
        id: uuidv4(),
        user_id: user.id,
        department_id: dept.id,
        role: 'admin_dept'
      } as any);
      console.log(`Berhasil memberikan role admin_dept ke Sutrisno.`);
    } else {
      console.log(`Akun Sutrisno (NIP: ${nip}) sudah ada di database.`);
    }

    console.log('=== SELESAI ===');
    console.log('Silakan Login di Postman dengan:');
    console.log('Email: 1001');
    console.log('Password: 1234');
    process.exit(0); 
  } catch(e) { 
    console.error('Gagal memasukkan data:', e); 
    process.exit(1); 
  } 
} 
injectAdmin();
