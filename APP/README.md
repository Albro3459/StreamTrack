### To run:
```sh
cd StreamTrack/APP
```

Things have changed so when developing try to just run it on the iOS 18.5 simulator.
Make sure you are signed into iCloud on the simulator for sign in with Apple
```sh
npx expo run:ios
```

Older way:
```sh
npm start
```

or
```sh
npx expo start
```

To clear cache:
```sh
npx expo start -c
```

### To connect to iPhone:

Can't really do now.

In StreamTrack/APP/.env, change DATA_API_URL from localhost to the computer's or servers IP Address.

In StreamTrack/API/Properties/launchSettings.json, change localhost to 0.0.0.0 to allow anyone on the same network. Mainly just in the HTTP section.

Scan the QR code on your phone


### EAS Build (Need an Apple Developer account and to register an Identifier for your app):

Be fully commited to GitHub
```sh
npx eas build:configure
```

Choose iOS

Secrets needed to be added to the EAS ENV:
```sh
eas env:create --name SECRET_NAME --value "..."
```
You can only do one at a time. Use the spacebar to pick the options. I did Development & Production


Make sure you are in the Git branch you want to build from, then build:
```sh
npx eas build -p ios --profile production
```