import 'dotenv/config';

export default {
  expo: {
    name: "StreamTrack",
    slug: "stream_track",
    owner: "albro3459",
    version: "1.0.0",
    orientation: "portrait",
    newArchEnabled: true,
    icon: "./assets/images/AppNameImage.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/AppNameImage.png",
      resizeMode: "contain",
      backgroundColor: "#1c2237"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "live.cloudlaunch.streamtrack",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/AppNameImage.png",
        backgroundColor: "#1c2237"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/AppNameImage.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-asset"
    ],
    experiments: {
      typedRoutes: true
    },
    assetBundlePatterns: [
      "assets/**/*"
    ],
    extra: {
      router: {},
      eas: {
        projectId: "8b6758e2-1727-486e-9570-b2fecd06aa1e"
      },
      // Secrets
      DATA_API_URL: process.env.DATA_API_URL,
      API_KEY: process.env.API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      PROJECT_ID: process.env.PROJECT_ID,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
      APP_ID: process.env.APP_ID,
      MEASUREMENT_ID: process.env.MEASUREMENT_ID,
      CLIENT_ID: process.env.CLIENT_ID,
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      url: "https://u.expo.dev/8b6758e2-1727-486e-9570-b2fecd06aa1e"
    }
  }
};
