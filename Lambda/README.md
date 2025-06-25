This will be used as a cloud lambda function to update the contents in the DB regularly.

It needs to be compiled to JS:
```sh
cd StreamTrack/Lambda
npm install
npm run build &&
node dist/handler.js
```

Then upload the zip to AWS