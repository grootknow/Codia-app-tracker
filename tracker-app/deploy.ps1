# CODIA Tracker - Auto Deploy Script

Write-Host "🚀 CODIA TRACKER - AUTO DEPLOY" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "📦 Building app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod --yes --token $env:VERCEL_TOKEN
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deploy complete!" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "Check your Vercel dashboard for the URL" -ForegroundColor Cyan
