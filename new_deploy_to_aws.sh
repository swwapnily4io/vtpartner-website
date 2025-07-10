#!/bin/bash

# AWS EC2 Deployment Script for Kaps Website
# This script zips the dist folder and deploys it to AWS EC2 instance

# Configuration
EC2_KEY="kaps-ec2-instance-key.pem"
EC2_USER="ubuntu"
EC2_HOST="ec2-44-203-96-86.compute-1.amazonaws.com"
TARGET_PATH="/var/www/kaps9.in/html"
ZIP_FILE="kaps-dist-$(date +%Y%m%d-%H%M%S).zip"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS EC2 Deployment for Kaps Website${NC}"
echo "=================================================="

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: dist folder not found!${NC}"
    echo "Please run 'npm run build' first to create the dist folder."
    exit 1
fi

# Check if EC2 key exists
if [ ! -f "$EC2_KEY" ]; then
    echo -e "${RED}❌ Error: EC2 key file '$EC2_KEY' not found!${NC}"
    exit 1
fi

# Set correct permissions for EC2 key
chmod 600 "$EC2_KEY"

echo -e "${YELLOW}📦 Step 1: Creating zip file from dist folder...${NC}"
# Create zip file from dist folder
zip -r "$ZIP_FILE" dist/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Zip file created successfully: $ZIP_FILE${NC}"
else
    echo -e "${RED}❌ Error: Failed to create zip file${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Step 2: Uploading zip file to EC2 instance...${NC}"
# Upload zip file to EC2 instance
scp -i "$EC2_KEY" "$ZIP_FILE" "$EC2_USER@$EC2_HOST:/tmp/"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ File uploaded successfully to EC2 instance${NC}"
else
    echo -e "${RED}❌ Error: Failed to upload file to EC2 instance${NC}"
    rm "$ZIP_FILE"
    exit 1
fi

echo -e "${YELLOW}🔧 Step 3: Deploying to target directory on EC2...${NC}"
# SSH into EC2 and deploy
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << EOF
    echo "Connected to EC2 instance"
    
    # Create backup of existing files
    echo "Creating backup of existing files..."
    if [ -d "$TARGET_PATH" ]; then
        sudo cp -r "$TARGET_PATH" "$TARGET_PATH.backup-\$(date +%Y%m%d-%H%M%S)"
        echo "Backup created successfully"
    fi
    
    # Create target directory if it doesn't exist
    sudo mkdir -p "$TARGET_PATH"
    
    # Move zip file to target directory
    sudo mv "/tmp/$ZIP_FILE" "$TARGET_PATH/"
    
    # Change to target directory
    cd "$TARGET_PATH"
    
    # Remove old files (except backup)
    echo "Removing old files..."
    sudo find . -maxdepth 1 -not -name '*.backup-*' -not -name '$ZIP_FILE' -not -name '.' -exec rm -rf {} + 2>/dev/null || true
    
    # Unzip new files
    echo "Extracting new files..."
    sudo unzip -o "$ZIP_FILE"
    
    # Move files from dist folder to root
    echo "Moving files from dist folder to root..."
    sudo mv dist/* . 2>/dev/null || true
    sudo rmdir dist 2>/dev/null || true
    
    # Remove zip file
    sudo rm "$ZIP_FILE"
    
    # Set proper permissions
    echo "Setting proper permissions..."
    sudo chown -R www-data:www-data "$TARGET_PATH"
    sudo chmod -R 755 "$TARGET_PATH"
    
    echo "Deployment completed successfully!"
    
    # List deployed files
    echo "Files in target directory:"
    ls -la "$TARGET_PATH"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
else
    echo -e "${RED}❌ Error: Deployment failed${NC}"
    rm "$ZIP_FILE"
    exit 1
fi

echo -e "${YELLOW}🧹 Step 4: Cleaning up local files...${NC}"
# Remove local zip file
rm "$ZIP_FILE"
echo -e "${GREEN}✅ Local cleanup completed${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment Summary:${NC}"
echo "=================================================="
echo "✅ Dist folder zipped successfully"
echo "✅ Files uploaded to EC2 instance"
echo "✅ Deployed to: $TARGET_PATH"
echo "✅ Backup created on server"
echo "✅ Proper permissions set"
echo "✅ Local cleanup completed"
echo ""
echo -e "${GREEN}🌐 Your website should now be live at: http://kaps9.in${NC}"
echo -e "${YELLOW}💡 Tip: Check the website to ensure everything is working correctly${NC}" 