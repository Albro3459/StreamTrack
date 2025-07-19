import 'dotenv/config';

const BackgroundColor = require("./constants/BackgroundColor");

console.log('BRODSKY DEBUG GOOGLE_SERVICES_PLIST:', process.env.GOOGLE_SERVICES_PLIST);
console.log('BRODSKY DEBUG EAS_BUILD_PROJECT_ROOT:', process.env.EAS_BUILD_PROJECT_ROOT);

export default {
    expo: {
        name: "StreamTrack",
        slug: "stream_track",
        owner: "albro3459",
        version: "1.0.0",
        orientation: "portrait",
        newArchEnabled: true,
        icon: "./assets/images/AppIconDark.png",
        scheme: "streamtrack",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/images/AppLogoClear.png",
            resizeMode: "contain",
            backgroundColor: BackgroundColor.backgroundColor
        },
        ios: {
            supportsTablet: true,
            // Apple
            bundleIdentifier: "live.cloudlaunch.streamtrack",
            usesAppleSignIn: true,
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false
            },
            // Google
            googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './ios/GoogleService-Info.plist',
        },
        android: {
            "package": "live.cloudlaunch.streamtrack",
            adaptiveIcon: {
                foregroundImage: "./assets/images/AppLogoClear.png",
                backgroundColor: BackgroundColor.backgroundColor
            }
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/AppIconDark.png"
        },
        plugins: [
            "expo-router",
            "expo-font",
            "expo-asset",
            // Apple
            "expo-apple-authentication",
            // Google
            "@react-native-firebase/app",
            "@react-native-firebase/auth",
            [
                "@react-native-google-signin/google-signin", { 
                    iosUrlScheme: "com.googleusercontent.apps.179090561769-hoosdhks01bjar4h641rnnt35f4f1g0u" 
                }
            ],
            [
                "expo-build-properties", {
                    ios: { 
                        useFrameworks: "dynamic" 
                    } 
                }
            ]
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
            WEB_CLIENT_ID: process.env.WEB_CLIENT_ID,
        },
        // runtimeVersion: { // EAS Build
        //   policy: "appVersion"
        // },
        runtimeVersion: "1.0.0", // npx expo run:ios
        updates: {
            url: "https://u.expo.dev/8b6758e2-1727-486e-9570-b2fecd06aa1e"
        }
    }
};
