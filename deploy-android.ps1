# Deploy Android to Play Store
Write-Host "🤖 Deploying Android to Play Store..." -ForegroundColor Blue
Set-Location android
bundle exec fastlane release
Set-Location .. 