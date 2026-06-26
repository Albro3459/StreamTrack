This will be used as a cloud lambda function to update the contents in the DB regularly.

Make sure the API is running so it can receive the content!

## Cloudflare Bot Fight Mode

The Lambda's requests to the API can get blocked by Cloudflare's Bot Fight Mode. Before running it (locally or the deployed cron), temporarily turn it off in **Cloudflare > Your domain > Security > Settings > Bot fight mode**, then turn it back on right after.

## Run
It needs to be compiled to JS:
```sh
cd StreamTrack/Lambda
npm install
npm run build
node dist/main.js # run the function
```

## Deploy
The `STREAMTRACK_SECRETS` environment variable must be set manually in AWS Lambda. See [Secrets](#secrets) below.

Use the deploy script to build, package, and upload the Lambda code:
```sh
cd Lambda && 
./deploy.sh && 
cd -
```

**OR** to manually compile and upload the Zip to AWS Lambda (total Zip must be under 50 MB):
```sh
cd StreamTrack/Lambda &&
npm run build &&
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

## Secrets

Read from a single `STREAMTRACK_SECRETS` env var holding the JSON blob (no AWS Secrets Manager) - shape in [secrets/example.STREAMTRACK_SECRETS.json](secrets/example.STREAMTRACK_SECRETS.json), real values in the gitignored `secrets/STREAMTRACK_SECRETS.json`.

To upload, the value is the raw JSON minified to one line (don't `JSON.stringify` it). Copy it, then paste into **Lambda -> Configuration -> Environment variables** under key `STREAMTRACK_SECRETS` (keep under the 4 KB limit):

```sh
cd Lambda
jq -c . secrets/STREAMTRACK_SECRETS.json | pbcopy
```

### Use locally
```sh
export STREAMTRACK_SECRETS="$(cat secrets/STREAMTRACK_SECRETS.json)"
```
