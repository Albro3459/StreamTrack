#!/usr/bin/env bash

# Run from the repo root:
# cd Lambda
# ./deploy.sh
#
# Zips and deploys the Lambda function to AWS.

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "$0")" && pwd)"

AWS_PROFILE_NAME="streamtrack"
OUTPUT_ROOT="$script_dir/.publish"

lambda_name="Lambda"
lambda_function_name="StreamTrackPopularContent"
lambda_dir="$script_dir"

bump_lambda_version() {
  local new_version

  new_version="$(cd "$lambda_dir" && npm version patch --no-git-tag-version)"

  echo "Lambda version: $new_version"
}

stage_root="$OUTPUT_ROOT/stage"
package_root="$OUTPUT_ROOT/packages"

stage_dir="$stage_root/$lambda_name"
output_path="$package_root/$lambda_name.zip"

echo "Preparing Lambda: $lambda_name"
echo "Source folder: $script_dir"
echo "Stage folder: $stage_dir"
echo "Output zip: $output_path"
echo "AWS profile: $AWS_PROFILE_NAME"

bump_lambda_version

if [ -e "$stage_dir" ]; then
  trash "$stage_dir"
fi
mkdir -p "$stage_dir" "$package_root"

echo "Installing dependencies & building Lambda"

(
  cd "$lambda_dir"
  npm install
  npm run build
)

echo "Copying Lambda runtime files"

dist_dir="$lambda_dir/dist"
node_modules_dir="$lambda_dir/node_modules"

if [ ! -d "$dist_dir" ]; then
  echo "Missing required directory: $dist_dir" >&2
  exit 1
fi

if [ ! -d "$node_modules_dir" ]; then
  echo "Missing required directory: $node_modules_dir" >&2
  exit 1
fi

cp -R "$dist_dir/." "$stage_dir/"
cp -R "$node_modules_dir" "$stage_dir/"
cp "$lambda_dir/package.json" "$stage_dir/"

echo "Pruning development dependencies"

(
  cd "$stage_dir"
  npm prune --omit=dev
)

if [ -e "$output_path" ]; then
  trash "$output_path"
fi

echo "Zipping Lambda package"

(
  cd "$stage_dir"
  zip -r "$output_path" . -x "*.DS_Store"
)

echo "Deploying to AWS Lambda function $lambda_function_name"

aws lambda update-function-code \
  --zip-file "fileb://$output_path" \
  --profile "$AWS_PROFILE_NAME" \
  --function-name "$lambda_function_name" \
  --architectures arm64 \
  --no-paginate

echo "Deployment completed successfully"
