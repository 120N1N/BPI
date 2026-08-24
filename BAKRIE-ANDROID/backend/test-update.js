const { TicketService } = require('./src/services/ticketService');
const { Ticket, User, Department, sequelize } = require('./src/models');

async function test() {
  try {
    const user = await User.findOne({ where: { employee_id: '1000' } });
    if (!user) { console.log('User 1000 not found'); return; }
    
    const ticket = await Ticket.findOne({ where: { created_by: user.id } });
    if (!ticket) { console.log('Ticket not found for user 1000'); return; }

    console.log('Testing TicketService.updateTicketStatus...');
    await TicketService.updateTicketStatus(
      ticket.id, 
      { status: 'ASSIGNED', notes: 'Test Assign', assigned_to: 'Dina' }, 
      user.id, 
      user.company_id
    );
    console.log('Success!');
  } catch (err) {
    console.error('Error during updateTicketStatus:');
    console.error(err);
  } finally {
    process.exit(0);
  }
}
test();
