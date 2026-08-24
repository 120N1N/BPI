async function runTest() {
  const baseURL = 'http://localhost:3001/api';

  try {
    console.log('1. Login as User (0000)');
    let res = await fetch(baseURL + '/auth/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '0000', password: '1234' }) 
    });
    let data = await res.json();
    const userToken = data.token;
    
    console.log('2. Create Ticket as User');
    res = await fetch(baseURL + '/tickets', {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + userToken 
      },
      body: JSON.stringify({
          title: 'Testing from API flow',
          description: 'Layar PC mati',
          category: 'HARDWARE',
          priority: 'HIGH',
          location: 'Ruang Rapat',
          department: 'it_infra'
      })
    });
    data = await res.json();
    const ticketId = data.ticket.id;
    console.log('Ticket created:', ticketId);

    console.log('3. Login as Admin Dept (Sutrisno - 1001)');
    res = await fetch(baseURL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '1001', password: '1234' })
    });
    data = await res.json();
    const adminToken = data.token;

    console.log('4. Assign Ticket using Name (Budi) - Same as UI');
    res = await fetch(baseURL + '/tickets/' + ticketId + '/status', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + adminToken
      },
      body: JSON.stringify({
          status: 'ASSIGNED',
          assigned_to: 'Budi'
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('Success! Ticket updated:', data.ticket.id, 'Status:', data.ticket.status, 'Assigned to:', data.ticket.assigned_to);

    console.log('5. Assign Ticket using Invalid Name - Should throw 400 now instead of crashing');
    res = await fetch(baseURL + '/tickets/' + ticketId + '/status', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            status: 'ASSIGNED',
            assigned_to: 'Teknisi Abal-Abal'
        })
    });
    data = await res.json();
    if (res.ok) {
        console.log("Wait, it succeeded? That shouldn't happen.");
    } else {
        console.log('Expected Error caught! Status:', res.status, data);
    }
    
  } catch (error) {
    console.error('Test Failed!', error.message);
  }
}

runTest();
