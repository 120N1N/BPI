const fs = require('fs');
const os = require('os');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    // Skip virtual or loopback interfaces if possible
    if (name.toLowerCase().includes('vboxnet') || name.toLowerCase().includes('vmware')) continue;
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = process.env.API_IP || '68.183.177.34'; // getLocalIp();
const configContent = `export const AppConfig = {
  apiServerIp: '${ip}'
};
`;

fs.writeFileSync('./src/app/config.ts', configContent);
console.log(`[Config Generator] Updated src/app/config.ts with IP: ${ip}`);
