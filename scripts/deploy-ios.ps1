# Deploy iOS to App Store
Write-Host "🍎 Deploying iOS to App Store..." -ForegroundColor Blue
Set-Location ios
bundle exec fastlane release
Set-Location .. 