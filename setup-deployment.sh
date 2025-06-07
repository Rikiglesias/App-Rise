#!/bin/bash

echo "🚀 Rise Against Hunger Italia - Setup Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm"
    exit 1
fi

print_success "Node.js and npm are installed"

# Step 2: Install Expo CLI
print_step "Installing/updating Expo CLI..."
npm install -g @expo/cli
print_success "Expo CLI ready"

# Step 3: Generate native projects
print_step "Generating native iOS project..."
if npx expo run:ios --no-build-cache --no-install; then
    print_success "iOS native project generated"
else
    print_warning "iOS generation failed (might need macOS) - continuing..."
fi

print_step "Generating native Android project..."
if npx expo run:android --no-build-cache --no-install; then
    print_success "Android native project generated"
else
    print_warning "Android generation failed - continuing..."
fi

# Step 4: Setup Ruby and Fastlane (if Ruby is available)
if command -v ruby &> /dev/null; then
    print_step "Setting up Fastlane..."
    
    if [ -d "ios" ]; then
        cd ios
        bundle install --path vendor/bundle
        cd ..
        print_success "iOS Fastlane setup complete"
    fi
    
    if [ -d "android" ]; then
        cd android
        bundle install --path vendor/bundle
        cd ..
        print_success "Android Fastlane setup complete"
    fi
else
    print_warning "Ruby not found. Install Ruby to use Fastlane locally"
fi

# Step 5: Create .gitignore updates
print_step "Updating .gitignore..."
cat >> .gitignore << 'EOF'

# Native projects
/ios/
/android/

# Fastlane
ios/fastlane/report.xml
ios/fastlane/Preview.html
ios/fastlane/screenshots
ios/fastlane/test_output
android/fastlane/report.xml
android/fastlane/Preview.html
android/fastlane/screenshots
android/fastlane/test_output

# Signing
*.keystore
*.p12
*.mobileprovision
google-play-service-account.json

# Bundler
vendor/bundle/
.bundle/
EOF

print_success ".gitignore updated"

# Step 6: Create quick deploy script
print_step "Creating quick deploy scripts..."

cat > deploy-ios.sh << 'EOF'
#!/bin/bash
echo "🍎 Deploying iOS to App Store..."
cd ios
bundle exec fastlane release
EOF

cat > deploy-android.sh << 'EOF'
#!/bin/bash
echo "🤖 Deploying Android to Play Store..."
cd android
bundle exec fastlane release
EOF

chmod +x deploy-ios.sh deploy-android.sh

print_success "Deploy scripts created"

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. 🔑 Setup GitHub Secrets:"
echo "   - APP_STORE_CONNECT_API_KEY"
echo "   - APP_STORE_CONNECT_API_KEY_ID"
echo "   - APP_STORE_CONNECT_ISSUER_ID"
echo "   - GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"
echo "   - ANDROID_KEYSTORE_FILE"
echo "   - ANDROID_KEYSTORE_PASSWORD"
echo "   - ANDROID_KEY_ALIAS"
echo "   - ANDROID_KEY_PASSWORD"
echo ""
echo "2. 🏗️ Create Apple Developer Account (\$99/year)"
echo "3. 🤖 Create Google Play Developer Account (\$25 one-time)"
echo "4. 📱 Generate signing certificates"
echo ""
echo "🚀 Deploy Commands:"
echo "   git tag v1.0.0 && git push --tags  # Auto-deploy via GitHub Actions"
echo "   ./deploy-ios.sh                    # Local iOS deploy"
echo "   ./deploy-android.sh                # Local Android deploy"
echo ""
echo "💡 Development (unchanged):"
echo "   npx expo start                     # Continue using Expo for development"
echo ""
print_success "You're ready to deploy! 🎯" 