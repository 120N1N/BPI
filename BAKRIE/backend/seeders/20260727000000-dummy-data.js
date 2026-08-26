'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const companyId = uuidv4();
    
    // Daftar Departemen
    const depts = [
      { id: uuidv4(), name: 'IT Infrastruktur', code: 'IT-INF' },
      { id: uuidv4(), name: 'IT System', code: 'IT-SYS' },
      { id: uuidv4(), name: 'Maintenance', code: 'MNT' },
      { id: uuidv4(), name: 'General Affair', code: 'GA' },
      { id: uuidv4(), name: 'Human Resources', code: 'HR' },
      { id: uuidv4(), name: 'Direksi', code: 'DIR' }
    ];
    
    const passwordHash = await bcrypt.hash('1234', 10);
    
    const users = [];
    const roles = [];
    
    let nipCounter = 1000;
    
    // NAMA-NAMA 1 KATA (Orang Indonesia)
    const adminDeptNames = ['Sutrisno', 'Bambang', 'Widodo', 'Haryanto', 'Kusuma', 'Ahmad'];
    const staffNames = [
      ['Budi', 'Agus', 'Cahya'],         // IT Infra
      ['Dina', 'Eko', 'Fajar'],          // IT System
      ['Gilang', 'Hadi', 'Iwan'],        // Maintenance
      ['Joko', 'Kiki', 'Lina'],          // GA
      ['Maya', 'Nina', 'Opie'],          // HR
      ['Raka', 'Sita', 'Tomi']           // Direksi (Staff Administrasi)
    ];
    
    // --- 1. SUPER ADMIN ---
    const adminId = uuidv4();
    const superAdminNip = nipCounter.toString();
    nipCounter++;
    users.push({ id: adminId, company_id: companyId, department_id: depts[1].id, name: 'Darrel', email: superAdminNip, password_hash: passwordHash, is_active: true, createdAt: new Date(), updatedAt: new Date() });
    roles.push({ id: uuidv4(), user_id: adminId, role: 'admin', department_id: depts[1].id, createdAt: new Date(), updatedAt: new Date() });
    
    // --- 2. ADMIN DEPT (1 Kata) ---
    for (let d = 0; d < depts.length - 1; d++) {
      const adminDeptId = uuidv4();
      const nip = nipCounter.toString();
      nipCounter++;
      users.push({ id: adminDeptId, company_id: companyId, department_id: depts[d].id, name: adminDeptNames[d], email: nip, password_hash: passwordHash, is_active: true, createdAt: new Date(), updatedAt: new Date() });
      roles.push({ id: uuidv4(), user_id: adminDeptId, role: 'admin_dept', department_id: depts[d].id, createdAt: new Date(), updatedAt: new Date() });
    }

    // --- 3. TEKNISI / STAFF (1 Kata, 3 Orang) ---
    for (let d = 0; d < depts.length - 1; d++) {
      for (let i = 0; i < 3; i++) {
        const staffId = uuidv4();
        const nip = nipCounter.toString();
        nipCounter++;
        users.push({ id: staffId, company_id: companyId, department_id: depts[d].id, name: staffNames[d][i], email: nip, password_hash: passwordHash, is_active: true, createdAt: new Date(), updatedAt: new Date() });
        roles.push({ id: uuidv4(), user_id: staffId, role: 'staff', department_id: depts[d].id, createdAt: new Date(), updatedAt: new Date() });
      }
    }
    
    // --- 4. KARYAWAN BIASA (1 Kata) ---
    const regularNames = ['Putra', 'Qori', 'Rizky'];
    for (let i = 0; i < 3; i++) {
      const userId = uuidv4();
      const nip = nipCounter.toString();
      nipCounter++;
      users.push({ id: userId, company_id: companyId, department_id: depts[4].id, name: regularNames[i], email: nip, password_hash: passwordHash, is_active: true, createdAt: new Date(), updatedAt: new Date() });
      roles.push({ id: uuidv4(), user_id: userId, role: 'user', department_id: depts[4].id, createdAt: new Date(), updatedAt: new Date() });
    }

    // --- 5. TEST USER KHUSUS (0000) ---
    const testUserId = uuidv4();
    users.push({ id: testUserId, company_id: companyId, department_id: depts[5].id, name: 'Penguji Khusus', email: '0000', password_hash: passwordHash, is_active: true, createdAt: new Date(), updatedAt: new Date() });
    roles.push({ id: uuidv4(), user_id: testUserId, role: 'user', department_id: depts[5].id, createdAt: new Date(), updatedAt: new Date() });

    await queryInterface.bulkInsert('Companies', [{ id: companyId, code: 'BPI', name: 'Bakrie Pipe Industries', slug: 'bakrie-pipe-industries', domain: 'Bakrie Pipe Industries', timezone: 'Asia/Jakarta', is_active: true, createdAt: new Date(), updatedAt: new Date() }]);
    const deptRows = depts.map(d => ({ id: d.id, company_id: companyId, name: d.name, code: d.code, description: `Departemen ${d.name}`, is_active: true, createdAt: new Date(), updatedAt: new Date() }));
    await queryInterface.bulkInsert('Departments', deptRows);
    await queryInterface.bulkInsert('Users', users);
    await queryInterface.bulkInsert('UserRoles', roles);
  },

  async down(queryInterface, Sequelize) {
    const tables = ['Surveys', 'TicketHistories', 'Tickets', 'UserRoles', 'Users', 'Departments', 'Companies'];
    for (const table of tables) {
      try {
        await queryInterface.bulkDelete(table, null, {});
      } catch (e) {
        console.log(`Skipping delete for ${table} as it might not exist.`);
      }
    }
  }
};
