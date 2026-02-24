import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.78bd5b6204d34b28b58723796d371bc2',
  appName: 'mobile-structura',
  webDir: 'dist',
  server: {
    url: 'https://78bd5b62-04d3-4b28-b587-23796d371bc2.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: false,
      style: 'dark',
    },
  },
};

export default config;
