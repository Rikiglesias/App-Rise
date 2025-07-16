#!/bin/bash

echo "🚀 Rise Against Hunger Italia - Publishing Script"
echo "=================================================="

# Check if EAS is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g @expo/eas-cli
fi

# Login to Expo
echo "🔑 Logging into Expo..."
eas login

# Configure EAS (first time only)
if [ ! -f "eas.json" ]; then
    echo "⚙️ Configuring EAS..."
    eas build:configure
fi

echo "🏗️ Choose build option:"
echo "1) Build for iOS App Store"
echo "2) Build for Android Play Store" 
echo "3) Build for both stores"
echo "4) Submit to stores (after build)"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🍎 Building for iOS App Store..."
        eas build --platform ios --profile production-store
        ;;
    2)
        echo "🤖 Building for Android Play Store..."
        eas build --platform android --profile production-store
        ;;
    3)
        echo "📱 Building for both stores..."
        eas build --platform all --profile production-store
        ;;
    4)
        echo "📤 Submitting to stores..."
        echo "Choose platform:"
        echo "1) Submit to iOS App Store"
        echo "2) Submit to Android Play Store"
        echo "3) Submit to both"
        
        read -p "Enter choice (1-3): " submit_choice
        
        case $submit_choice in
            1)
                eas submit --platform ios --profile production
                ;;
            2)
                eas submit --platform android --profile production
                ;;
            3)
                eas submit --platform all --profile production
                ;;
        esac
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo "✅ Process completed!" 