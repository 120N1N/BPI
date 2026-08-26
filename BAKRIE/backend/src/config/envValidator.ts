import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'JWT_SECRET'
];

export const validateEnv = () => {
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(`🚨 FATAL ERROR: Kehilangan variabel lingkungan (Environment Variables) wajib!`);
    console.error(`Silakan periksa file .env Anda. Variabel berikut tidak ditemukan:`);
    console.error(missingVars.map(v => `- ${v}`).join('\n'));
    console.error(`🚨 Menghentikan sistem (Server Shutdown) demi keamanan...`);
    process.exit(1);
  }

  console.log(`✅ Environment Variables terverifikasi lengkap.`);
};
