import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.co.bakrie.app',
  appName: 'BakrieApp',
  webDir: 'dist/bakrie-app/browser',
  server: {
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    }
  }
};

export default config;
