This will be used as a cloud lambda function to update the contents in the DB regularly.

Make sure the API is running so it can receive the content!

It needs to be compiled to JS:
```sh
cd StreamTrack/Lambda
npm install
npm run build &&
node dist/handler.js
```

Then upload the zip to AWS