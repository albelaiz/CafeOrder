#!/bin/bash

# Deployment verification script for Café Direct

echo "🚀 Verifying Café Direct deployment readiness..."
echo

# Check if required files exist
echo "📁 Checking deployment files..."
files=("Dockerfile" "fly.toml" ".dockerignore" "DEPLOY.md")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done
echo

# Test health check endpoint
echo "🔍 Testing health check endpoint..."
response=$(curl -s -w "HTTP_CODE:%{http_code}" http://localhost:5000/api/health)
http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')

if [ "$http_code" = "200" ] && [ "$body" = "OK" ]; then
    echo "✅ Health check endpoint working (200 OK)"
else
    echo "❌ Health check failed (HTTP $http_code, Body: $body)"
    exit 1
fi
echo

# Check if server binds to correct address
echo "🌐 Testing server configuration..."
if netstat -ln | grep -q ":5000.*0.0.0.0"; then
    echo "✅ Server binding to 0.0.0.0"
else
    echo "⚠️  Server may not be binding to 0.0.0.0 (check manually)"
fi
echo

echo "🎉 Deployment verification complete!"
echo "Ready to deploy with: fly deploy"