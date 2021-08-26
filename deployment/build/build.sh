#!/usr/bin/env bash

cwd=$(pwd)

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Set the directory
directory=${SCRIPT_DIR}/../..

echo "> Set the directory to '$directory'"

cd $directory || exit

# Remove the dist folder
echo "> Remove the 'dist' folder at '$directory/dist'"

rm -rf $directory/dist

# Build the project
npm run build && npm run bundle && npm run bundle:min

# Compress the files into a package
cd dist/bundle || exit
zip -r ../bundle.zip ./*
cd ../..

cd dist/bundle-min || exit
zip -r ../bundle-min.zip ./*
cd ../..

# Copy the node_modules in cjs
cp -r node_modules dist/cjs

cd dist/cjs || exit
zip -r ../lambda.zip ./*
cd ../..

# Reset current directory
echo "> Reset the directory to what it was '$cwd'"

cd $cwd || exit