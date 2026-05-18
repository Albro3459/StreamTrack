Plan only. No files changed yet.

**Plan**

1. **Upgrade Expo/RN stack**
   - Update [APP/package.json](./APP/package.json:31) from Expo SDK 53 to SDK 55.
   - Target versions from Expo docs:
     - `expo`: `^55.0.24`
     - `react-native`: `0.83.x`
     - `react`: `19.2.0`
     - `react-dom`: `19.2.0`
     - Node: `20.19.x`
   - Run Expo dependency alignment after package edits so Expo-managed native packages land on SDK 55-compatible versions.
   - Update `eas-cli` from `16.14.1` to current `18.13.0`.

2. **Clean SDK 55 config**
   - Remove `newArchEnabled: true` from [APP/app.config.js](./APP/app.config.js:12). SDK 55 requires New Architecture, so this option is obsolete.
   - Keep `expo-build-properties`, but verify `useFrameworks: "dynamic"` still works with Firebase pods after prebuild.

3. **Pin EAS iOS image**
   - Update [APP/eas.json](./APP/eas.json:6) profiles with:
     - `ios.image: "macos-sequoia-15.6-xcode-26.2"`
   - This is Expo’s current SDK 55 image alias target, with Xcode 26.2, Node 20.19.4, npm 10.9.3, CocoaPods 1.16.2. Source: [Expo build infrastructure](https://docs.expo.dev/build-reference/infrastructure/).

4. **Update identifiers**
   - Change [APP/app.config.js](./APP/app.config.js:25):
     - `ios.bundleIdentifier`: `com.gocloudlaunch.streamtrack`
   - Also update Android package at [APP/app.config.js](./APP/app.config.js:12).
   - Update [APP/example.GoogleService-Info.plist](./APP/example.GoogleService-Info.plist:16) sample bundle id.

5. **Auth platform follow-up**
   - Apple Developer portal: create/enable App ID for `com.gocloudlaunch.streamtrack`, with Sign in with Apple.
   - Firebase/Google: add a new iOS app for `com.gocloudlaunch.streamtrack`, download a fresh `GoogleService-Info.plist`, and update EAS secret file.
   - Verify `iosUrlScheme` in [APP/app.config.js](./APP/app.config.js:56) matches the new plist `REVERSED_CLIENT_ID`.

6. **Track lockfile**
   - Add `!APP/package-lock.json` to [.gitignore](./.gitignore:3).
   - Run `npm install` in `APP/` so `APP/package-lock.json` is created and can be tracked.

7. **Privacy policy URL**
   - Search all repo mentions and update any policy URL to:
     - `https://streamtrack.gocloudlaunch.com/privacy-policy`
   - Current API already serves `/privacy-policy` from [API/Program.cs](./API/Program.cs:102), and Caddy allows that route.
   - If App Store metadata stores this outside repo, update it in App Store Connect too.

8. **Regenerate and validate**
   - Remove any ignored local `APP/ios` before prebuild.
   - Run Expo prebuild for iOS.
   - Run iOS build locally or EAS dev build.
   - Validate Apple Sign In and Google Sign In on iOS.
   - Run lint/build validation, not tests unless you ask.

Sources: [Expo SDK 55 compatibility table](https://docs.expo.dev/versions/v55.0.0/) and [Apple SDK submission requirement](https://developer.apple.com/news/upcoming-requirements/?id=02032026a).