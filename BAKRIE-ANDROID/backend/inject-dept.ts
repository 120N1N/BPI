import dotenv from 'dotenv';
dotenv.config();
import sequelize from './src/config/database'; 
import { Department, Company } from './src/models'; 
import { v4 as uuidv4 } from 'uuid';

async function injectData() { 
  try { 
    await sequelize.authenticate(); 
    console.log('Menyiapkan tabel dasar...');
    await sequelize.sync(); 
    
    // Cari company
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

    // Cari/Buat Department "IT Infrastruktur"
    const deptName = 'IT Infrastruktur';
    let dept = await Department.findOne({ where: { name: deptName } });
    if (!dept) {
      await Department.create({
        id: uuidv4(),
        company_id: company.id,
        name: deptName,
        code: 'IT-INF',
        description: 'Testing',
        is_active: true
      } as any);
      console.log(`Berhasil membuat Departemen: ${deptName}`);
    } else {
      console.log(`Departemen ${deptName} sudah ada.`);
    }

    console.log('Data siap digunakan untuk testing Postman!');
    process.exit(0); 
  } catch(e) { 
    console.error('Gagal memasukkan data:', e); 
    process.exit(1); 
  } 
} 
injectData();
