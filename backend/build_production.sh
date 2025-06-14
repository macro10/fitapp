# backend/build_production.sh
#!/bin/bash

# Exit on error
set -e

# 1. Build the React app with production settings
echo "Building React app for production..."
cd ../frontend
npm run build:prod

# 2. Copy build output to backend/static
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

# 4. Collect static files
echo "Collecting static files..."
cd ..
python manage.py collectstatic --noinput

echo "Done! Production build is ready!"