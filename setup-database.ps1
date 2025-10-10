# MongoDB Article Cache Database - Quick Setup Script

Write-Host "🚀 Setting up MongoDB Article Cache Database..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is installed
Write-Host "1. Checking MongoDB installation..." -ForegroundColor Yellow
$mongoInstalled = Get-Command mongod -ErrorAction SilentlyContinue

if (-not $mongoInstalled) {
    Write-Host "❌ MongoDB not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install MongoDB Community Server:" -ForegroundColor Yellow
    Write-Host "  Option 1: Download from https://www.mongodb.com/try/download/community"
    Write-Host "  Option 2: Install with Chocolatey: choco install mongodb"
    Write-Host "  Option 3: Install with winget: winget install MongoDB.Server"
    Write-Host ""
    exit 1
} else {
    Write-Host "✅ MongoDB is installed" -ForegroundColor Green
}

# Check if MongoDB service is running
Write-Host ""
Write-Host "2. Checking MongoDB service..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($mongoService) {
    if ($mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB service is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB"
        Start-Sleep -Seconds 2
        Write-Host "✅ MongoDB service started" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  MongoDB service not found. You may need to start mongod manually:" -ForegroundColor Yellow
    Write-Host "   mongod --dbpath='C:\data\db'" -ForegroundColor Cyan
}

# Check if Node.js and npm are installed
Write-Host ""
Write-Host "3. Checking Node.js and npm..." -ForegroundColor Yellow
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
$npmInstalled = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeInstalled -or -not $npmInstalled) {
    Write-Host "❌ Node.js/npm not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
} else {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
    Write-Host "✅ npm $npmVersion installed" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "4. Installing npm dependencies..." -ForegroundColor Yellow
cd "$PSScriptRoot\backend"

if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "⚠️  node_modules already exists. Installing mongoose..." -ForegroundColor Yellow
    npm install mongoose
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Create data directory if needed
Write-Host ""
Write-Host "5. Setting up MongoDB data directory..." -ForegroundColor Yellow
$dataPath = "C:\data\db"

if (-not (Test-Path $dataPath)) {
    Write-Host "Creating $dataPath..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
    Write-Host "✅ Data directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Data directory exists" -ForegroundColor Green
}

# Test MongoDB connection
Write-Host ""
Write-Host "6. Testing MongoDB connection..." -ForegroundColor Yellow
$testScript = @"
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/investing101', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connection successful');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
setTimeout(() => {
  console.error('❌ Connection timeout');
  process.exit(1);
}, 5000);
"@

$testScript | Out-File -FilePath "$PSScriptRoot\backend\test-connection.js" -Encoding utf8
$testResult = node "$PSScriptRoot\backend\test-connection.js" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host $testResult -ForegroundColor Green
} else {
    Write-Host $testResult -ForegroundColor Red
    Write-Host ""
    Write-Host "MongoDB connection failed. Please ensure MongoDB is running:" -ForegroundColor Yellow
    Write-Host "  net start MongoDB" -ForegroundColor Cyan
    Write-Host "  OR" -ForegroundColor Yellow
    Write-Host "  mongod --dbpath='C:\data\db'" -ForegroundColor Cyan
    exit 1
}

# Clean up test file
Remove-Item "$PSScriptRoot\backend\test-connection.js" -ErrorAction SilentlyContinue

# All done!
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "Your MongoDB article cache database is ready to use!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start the backend server:" -ForegroundColor White
Write-Host "     cd backend" -ForegroundColor Cyan
Write-Host "     npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Test the API endpoints:" -ForegroundColor White
Write-Host "     curl http://localhost:4000/api/articles/stats" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. View database contents:" -ForegroundColor White
Write-Host "     mongosh" -ForegroundColor Cyan
Write-Host "     use investing101" -ForegroundColor Cyan
Write-Host "     db.articles.countDocuments({ isActive: true })" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 For more details, see DATABASE_SETUP.md" -ForegroundColor Yellow
Write-Host ""
