const { TicketService } = require('./src/services/ticketService');
const { Ticket, User, Department, sequelize } = require('./src/models');

async function runLifecycleTest() {
  console.log('--- Memulai Simulasi End-to-End Lifecycle Tiket ---');
  try {
    // 1. Dapatkan aktor
    const requester = await User.findOne({ where: { email: '0000' } }); // User
    const admin = await User.findOne({ where: { email: '1002' } }); // Admin 1002
    const staff = await User.findOne({ where: { email: '1012' } }); // Staff 1012
    
    if (!requester || !admin || !staff) {
      console.log('Gagal menemukan data User/Admin/Staff untuk testing.');
      process.exit(1);
    }

    const dept = await Department.findByPk(admin.department_id);

    console.log(`1. [USER ${requester.name}] Membuat tiket baru ke Dept ${dept.name}...`);
    const newTicket = await TicketService.createTicket(
      { 
        title: 'Sistem Error Saat Login', 
        description: 'Tidak bisa login ke ERP BPI', 
        priority: 'high', 
        category: 'software', 
        department_name: dept.name 
      }, 
      requester.id, 
      requester.company_id
    );
    console.log(`   Berhasil dibuat! Tiket ID: ${newTicket.id} | Status: ${newTicket.status}`);

    console.log(`2. [ADMIN ${admin.name}] Meng-assign tiket ke Teknisi (${staff.name})...`);
    const assignedTicket = await TicketService.updateTicketStatus(
      newTicket.id, 
      { status: 'ASSIGNED', notes: 'Segera cek kendala user', assigned_to: staff.id }, 
      admin.id, 
      admin.company_id
    );
    console.log(`   Berhasil di-assign! Status: ${assignedTicket.status} | Teknisi ID: ${assignedTicket.assigned_to}`);

    console.log(`3. [TEKNISI ${staff.name}] Mulai mengerjakan tiket...`);
    const inProgressTicket = await TicketService.updateTicketStatus(
      newTicket.id, 
      { status: 'IN_PROGRESS', notes: 'Sedang mengecek log server' }, 
      staff.id, 
      staff.company_id
    );
    console.log(`   Status berubah menjadi: ${inProgressTicket.status}`);

    console.log(`4. [TEKNISI ${staff.name}] Upload bukti dan menandai tiket selesai...`);
    await TicketService.addEvidence(
      newTicket.id, staff.id, staff.company_id, '/uploads/dummy.jpg', 'image/jpeg', 'Log server sudah dibersihkan'
    );
    const pendingApproveTicket = await TicketService.updateTicketStatus(
      newTicket.id, 
      { status: 'PENDING_APPROVAL', notes: 'Log server sudah dibersihkan' }, 
      staff.id, 
      staff.company_id
    );
    console.log(`   Berhasil ditandai selesai! Status: ${pendingApproveTicket.status}`);

    console.log(`5. [USER ${requester.name}] Pelapor menyetujui hasil perbaikan (Tutup Tiket)...`);
    const closedTicket = await TicketService.updateTicketStatus(
      newTicket.id, 
      { status: 'CLOSED', notes: 'Terima kasih, sudah bisa login' }, 
      requester.id, 
      requester.company_id
    );
    console.log(`   Tiket Selesai dan Ditutup! Status Final: ${closedTicket.status}`);
    console.log(`   Closed At: ${closedTicket.closed_at}`);
    
    console.log('--- Simulasi Berhasil 100%! Tidak ada Error. ---');

  } catch (err) {
    console.error('--- Simulasi GAGAL ---');
    console.error(err);
  } finally {
    process.exit(0);
  }
}
runLifecycleTest();
