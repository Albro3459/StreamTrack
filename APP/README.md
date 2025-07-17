### To run:
```sh
cd StreamTrack/APP
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

In StreamTrack/APP/secrets/DataAPIURL.ts, change localhost to the computer's or servers IP Address.

In StreamTrack/API/Properties/launchSettings.json, change localhost to 0.0.0.0 to allow anyone on the same network. Mainly just in the HTTP section.

Scan the QR code on your phone


### EAS Build (Need an Apple Developer account and to register an Identifier for your app):

Be fully commited to GitHub
```sh
npx eas build:configure
```

Choose iOS

Make sure you are in the Git branch you want to build from, then build:
```sh
npx eas build -p ios --profile production
```