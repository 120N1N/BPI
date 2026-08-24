const request = require('http').request;

const postData = JSON.stringify({ email: '1000', password: '1234' });

const req = request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('RESPONSE:', res.statusCode, body));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
