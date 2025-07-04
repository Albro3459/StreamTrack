To run:

cd StreamTrack/APP

npm start

or

npx expo start

To clear cache:

npx expo start -c


To connec to iPhone:

In StreamTrack/APP/secrets/DataAPIURL.ts, change localhost to the computer's or servers IP Address.

In StreamTrack/API/Properties/launchSettings.json, change localhost to 0.0.0.0 to allow anyone on the same network. Mainly just in the HTTP section.

npx expo start -c

Scan the QR code on your phone