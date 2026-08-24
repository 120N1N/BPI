const fs = require('fs');

const API_URL = 'http://localhost:3001/api';

const DEPARTMENTS = [
  { name: 'IT Infrastruktur', code: 'it_infra', adminNip: '1001', staffNip: '1006' },
  { name: 'IT System', code: 'it_sistem', adminNip: '1002', staffNip: '1009' },
  { name: 'Maintenance', code: 'maintenance', adminNip: '1003', staffNip: '1012' },
  { name: 'General Affair', code: 'ga', adminNip: '1004', staffNip: '1015' },
  { name: 'Human Resources', code: 'hr', adminNip: '1005', staffNip: '1018' }
];

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
    console.error(`Login failed for ${email}:`, err.message);
    throw err;
  }
}

async function runLifecycleForDepartment(dept) {
  console.log(`\n========================================`);
  console.log(`🚀 TESTING LIFECYCLE FOR: ${dept.name.toUpperCase()}`);
  console.log(`========================================`);

  try {
    const userToken = await login('0000');
    const adminToken = await login(dept.adminNip);
    const staffToken = await login(dept.staffNip);
    console.log(`✅ [1/5] Login Successful (User: 0000, Admin: ${dept.adminNip}, Staff: ${dept.staffNip})`);

    // 1. User Creates Ticket
    let res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: `LIFECYCLE TEST - ${dept.name}`,
        description: `This ticket must be handled by ${dept.name} department exclusively.`,
        category: 'other',
        department_name: dept.code === 'it_sistem' ? 'IT System' : 
                         dept.code === 'maintenance' ? 'Maintenance' : 
                         dept.code === 'ga' ? 'General Affair' : 
                         dept.code === 'hr' ? 'Human Resources' : 
                         'IT Infrastruktur',
        priority: 'P2'
      })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(data.message);
    const ticketId = data.ticket.id;
    console.log(`✅ [2/5] User created ticket (ID: ${ticketId}) targeting ${dept.name}`);

    // 2. Admin Assigns Ticket to Staff
    res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'ASSIGNED',
        notes: `Admin ${dept.adminNip} assigning to Staff ${dept.staffNip}`,
        assigned_to: dept.staffNip
      })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    console.log(`✅ [3/5] Admin successfully assigned ticket to Staff`);

    // 3. Staff Solves Ticket (In Progress -> Pending Approval)
    await fetch(`${API_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({ status: 'IN_PROGRESS', notes: 'Staff working on it.' })
    });
    
    res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        status: 'PENDING_APPROVAL',
        notes: `Staff ${dept.staffNip} has resolved the issue.`
      })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    console.log(`✅ [4/5] Staff successfully resolved the ticket`);

    // 4. User Submits Survey
    res = await fetch(`${API_URL}/tickets/${ticketId}/survey`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        rating: 5,
        feedback: `Great job, ${dept.name}!`
      })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    console.log(`✅ [5/5] User submitted CSAT rating and CLOSED the ticket`);
    
    console.log(`\n🎉 SUCCESS: Full lifecycle for ${dept.name} works perfectly!`);
    return true;

  } catch (err) {
    console.error(`\n❌ FAILED for ${dept.name}:`, err.message);
    return false;
  }
}

async function runAll() {
  let allPassed = true;
  for (const dept of DEPARTMENTS) {
    const passed = await runLifecycleForDepartment(dept);
    if (!passed) allPassed = false;
  }
  
  console.log(`\n========================================`);
  if (allPassed) {
    console.log(`⭐⭐⭐⭐⭐ ALL DEPARTMENTS PASSED LIFECYCLE TESTS! ⭐⭐⭐⭐⭐`);
  } else {
    console.log(`❌ SOME DEPARTMENTS FAILED THE LIFECYCLE TESTS.`);
  }
}

runAll();
