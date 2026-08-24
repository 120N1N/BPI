const API_URL = 'http://localhost:3001/api';

async function login(email) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: '1234' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data.token;
  } catch (err) {
    console.error(`Login failed for ${email}`, err.message);
    throw err;
  }
}

async function runTests() {
  let userToken, adminToken, staffToken;
  let ticketId;

  console.log('--- STARTING QA E2E TESTING ---');

  try {
    console.log('1. Authenticating Roles...');
    userToken = await login('0000'); // User Khusus
    adminToken = await login('1001'); // Admin IT Infra (Sutrisno)
    staffToken = await login('1006'); // Staff IT Infra (Budi)
    console.log('✅ Authentication Successful\n');

    console.log('2. Testing [USER] Role - Create Ticket');
    let res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: 'QA Test Ticket',
        description: 'Layar komputer berkedip',
        category: 'hardware',
        department_name: 'IT Infrastruktur',
        priority: 'P2'
      })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(data.message);
    
    ticketId = data.ticket.id;
    console.log(`✅ Ticket Created successfully (ID: ${ticketId})\n`);

    console.log('3. Testing [ADMIN] Role - Fetch and Assign Ticket');
    res = await fetch(`${API_URL}/tickets`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    data = await res.json();
    if (!res.ok) throw new Error(data.message);
    
    const foundTicket = data.find(t => t.id === ticketId);
    if (!foundTicket) throw new Error('Admin cannot see the newly created ticket!');
    console.log('✅ Admin successfully fetched tickets');

    res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'ASSIGNED',
        notes: 'Assigned to teknisi infra via automated QA',
        assigned_to: '1006'
      })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    console.log('✅ Admin successfully assigned ticket\n');

    console.log('4. Testing [STAFF] Role - Update to IN_PROGRESS');
    res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        notes: 'Teknisi sedang mengecek kabel monitor'
      })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    console.log('✅ Staff successfully updated status to IN_PROGRESS\n');

    console.log('5. Testing [STAFF] Role - Update to PENDING_APPROVAL');
    res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        status: 'PENDING_APPROVAL',
        notes: 'Kabel VGA sudah diganti. Menunggu konfirmasi user.'
      })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    console.log('✅ Staff successfully resolved ticket (PENDING_APPROVAL)\n');

    console.log('6. Testing [USER] Role - Submit Survey and CLOSE');
    res = await fetch(`${API_URL}/tickets/${ticketId}/survey`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        rating: 5,
        feedback: 'Mantap cepat sekali perbaikannya!'
      })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    console.log('✅ User successfully submitted survey and closed ticket\n');

    console.log('--- ALL QA TESTS PASSED SUCCESSFULLY! 💯 ---');

  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
  }
}

runTests();
