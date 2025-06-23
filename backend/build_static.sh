#!/bin/bash

# Exit on error
set -e

# 1. Build the React app
echo "Building React app..."
cd ../frontend
npm run build

# 2. Copy build output to backend/static (remove old files first)
echo "Copying build output to backend/static..."
cd ../backend/static
rm -rf ./*

cd ../../frontend/build
cp -r . ../../backend/static/

# 3. Move static/* up one level and remove the empty static dir
cd ../../backend/static
if [ -d "static" ]; then
  echo "Moving static/* up one level..."
  mv static/* .
  rmdir static
fi

# Fix the manifest link
sed -i '' 's/href="\.\/manifest\.json"/href="\/static\/manifest.json"/' index.html

echo "Done! Static files are ready in backend/static/"