This will be used as a cloud lambda function to update the contents in the DB regularly.

Make sure the API is running so it can receive the content!

It needs to be compiled to JS:
```sh
cd StreamTrack/Lambda
npm install
npm run build && cp secrets/FirebaseServiceAccount.json dist/secrets/FirebaseServiceAccount.json &&
node dist/main.js # run the function
```

To compile and upload the Zip to AWS Lambda (total Zip must be under 50 MB):
```sh
cd StreamTrack/Lambda &&
npm run build && rm -rf dist/secrets &&
npm prune --omit=dev &&
rm -rf /var/tmp/lambda && mkdir -p /var/tmp/lambda &&
cp -r dist/* /var/tmp/lambda/ && cp -r node_modules /var/tmp/lambda/
cd /var/tmp/lambda/ && zip -rFS ~/Desktop/lambda.zip . && cd -
```

Upload lambda.zip to AWS

Make sure in the Lambda Run Time settings, the handler is dist/index.handler (filename.function_name)

Choose Node.js 20/22

Do NOT expose as a public lambda url. This will be run only internally as a cron job.

Or run it manually in AWS Lambda with the "Test" button.
