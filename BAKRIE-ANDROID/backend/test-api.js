const fs = require('fs');

async function testApi() {
  try {
    // Generate token by calling login API
    const authRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '0000', password: '1234' })
    });
    
    if (!authRes.ok) {
       console.log('Login failed:', await authRes.text());
       return;
    }
    const authData = await authRes.json();
    const token = authData.token;
    
    console.log('Login Success! Token snippet:', token.substring(0, 15));
    
    // Fetch tickets
    const ticketRes = await fetch('http://localhost:3001/api/tickets', {
       headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!ticketRes.ok) {
       console.log('Ticket fetch failed:', await ticketRes.text());
       return;
    }
    
    const tickets = await ticketRes.json();
    console.log('Returned Tickets Count:', tickets.length);
    console.log('First ticket:', tickets[0] ? tickets[0].title : 'None');
    
  } catch (error) {
    console.error('Test script error:', error);
  }
}

testApi();
