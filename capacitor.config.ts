import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kage.app',
  appName: 'Kage',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    buildOptions: {
      javaVersion: '21'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1f2937",
      androidSplashResourceName: "splash",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1f2937"
    }
  }
};

export default config;
