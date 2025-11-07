# Script to organize prototype files into structured directories

$sourceDir = "c:\Users\carte\inv101\prototype"
$targetDir = "c:\Users\carte\inv101\prototype\organized"

Write-Host "Organizing project files..." -ForegroundColor Green

# Helper function to copy files
function Copy-FileToOrganized {
    param (
        [string]$Source,
        [string]$Destination
    )
    if (Test-Path $Source) {
        Copy-Item $Source $Destination -Force
        Write-Host "  ✓ Copied: $(Split-Path $Source -Leaf)" -ForegroundColor Cyan
    }
}

# 1. Copy Calculator pages
Write-Host "`nOrganizing Calculator Pages..." -ForegroundColor Yellow
$calcFiles = Get-ChildItem "$sourceDir\calc-*.html"
foreach ($file in $calcFiles) {
    Copy-FileToOrganized $file.FullName "$targetDir\pages\calculators\$($file.Name)"
}
Copy-FileToOrganized "$sourceDir\calculators.html" "$targetDir\pages\calculators\index.html"

# 2. Copy Lesson pages
Write-Host "`nOrganizing Lesson Pages..." -ForegroundColor Yellow
$lessonFiles = @("lessons.html", "lesson-foundations.html", "lesson-instruments.html", 
                 "lesson-market.html", "lesson-practical.html")
foreach ($file in $lessonFiles) {
    $source = Join-Path $sourceDir $file
    if ($file -eq "lessons.html") {
        Copy-FileToOrganized $source "$targetDir\pages\lessons\index.html"
    } else {
        Copy-FileToOrganized $source "$targetDir\pages\lessons\$file"
    }
}

# 3. Copy Simulator pages
Write-Host "`nOrganizing Simulator Pages..." -ForegroundColor Yellow
$simFiles = @("market-simulator.html", "market-simulator-new.html", "play-the-ai.html",
              "simulator.html", "simulator-invest101.html", "simulation.html", 
              "stock-analysis.html", "trading.html")
foreach ($file in $simFiles) {
    $source = Join-Path $sourceDir $file
    if ($file -eq "simulator.html") {
        Copy-FileToOrganized $source "$targetDir\pages\simulators\index.html"
    } else {
        Copy-FileToOrganized $source "$targetDir\pages\simulators\$file"
    }
}

# 4. Copy Profile pages
Write-Host "`nOrganizing Profile Pages..." -ForegroundColor Yellow
$profileFiles = @("profile.html", "profile-main.html", "profile-main-enhanced.html", 
                  "my-profile.html", "user-profile.html", "settings.html")
foreach ($file in $profileFiles) {
    $source = Join-Path $sourceDir $file
    if ($file -eq "profile.html") {
        Copy-FileToOrganized $source "$targetDir\pages\profile\index.html"
    } else {
        Copy-FileToOrganized $source "$targetDir\pages\profile\$file"
    }
}

# 5. Copy Auth pages
Write-Host "`nOrganizing Auth Pages..." -ForegroundColor Yellow
$authFiles = @("signin.html", "signup.html")
foreach ($file in $authFiles) {
    Copy-FileToOrganized (Join-Path $sourceDir $file) "$targetDir\pages\auth\$file"
}

# 6. Copy main pages to root of pages
Write-Host "`nOrganizing Main Pages..." -ForegroundColor Yellow
$mainPages = @("index.html", "achievements.html", "activity-feed.html", "leaderboard.html",
               "leaderboards.html", "friends.html", "friends-enhanced.html", "newsletter.html",
               "comparison.html", "compare-portfolios.html", "politician-portfolio.html",
               "market-analyzer.html", "stock-recommendations.html", "notifications.html",
               "subscription.html", "privacy.html", "terms.html", "404.html")
foreach ($file in $mainPages) {
    Copy-FileToOrganized (Join-Path $sourceDir $file) "$targetDir\pages\$file"
}

# 7. Organize JavaScript files

# Components (UI-related JavaScript)
Write-Host "`nOrganizing Component Scripts..." -ForegroundColor Yellow
$componentFiles = @("auth-widget.js", "global-ui.js", "shared-ui.js", "theme-switcher.js",
                   "article-display.js", "device-detection.js")
foreach ($file in $componentFiles) {
    Copy-FileToOrganized (Join-Path $sourceDir $file) "$targetDir\scripts\components\$file"
}

# Services (API and data handling)
Write-Host "`nOrganizing Service Scripts..." -ForegroundColor Yellow
$serviceFiles = @("api-client.js", "article-api.js", "ai-toolkit.js", 
                 "simulator-engine.js", "stock-simulator.js", "simulator-invest101.js")
foreach ($file in $serviceFiles) {
    Copy-FileToOrganized (Join-Path $sourceDir $file) "$targetDir\scripts\services\$file"
}

# Utils (utility functions)
Write-Host "`nOrganizing Utility Scripts..." -ForegroundColor Yellow
$utilFiles = @("config.js", "newsletter-utils.js")
foreach ($file in $utilFiles) {
    Copy-FileToOrganized (Join-Path $sourceDir $file) "$targetDir\scripts\utils\$file"
}

# 8. Copy assets
Write-Host "`nOrganizing Assets..." -ForegroundColor Yellow
if (Test-Path "$sourceDir\assets") {
    Copy-Item "$sourceDir\assets\*" "$targetDir\assets\" -Recurse -Force
    Write-Host "  ✓ Copied assets folder" -ForegroundColor Cyan
}

# 9. Copy integration examples if needed
if (Test-Path "$sourceDir\integration-examples") {
    Write-Host "`nCopying Integration Examples..." -ForegroundColor Yellow
    Copy-Item "$sourceDir\integration-examples" "$targetDir\integration-examples" -Recurse -Force
    Write-Host "  ✓ Copied integration examples" -ForegroundColor Cyan
}

# 10. Create a reference document
Write-Host "`nCreating file mapping reference..." -ForegroundColor Yellow
$mappingContent = @'
# File Organization Map
Generated: {0}

## Directory Structure

organized/
├── pages/
│   ├── auth/           # Authentication pages
│   ├── calculators/    # All calculator tools
│   ├── lessons/        # Educational content
│   ├── profile/        # User profile pages
│   ├── simulators/     # Market simulation tools
│   └── other.html      # Main pages (index, achievements, etc.)
├── scripts/
│   ├── components/     # UI components (auth-widget, theme-switcher, etc.)
│   ├── services/       # API and data services
│   └── utils/          # Utility functions
├── styles/
│   └── main.css        # Single Tailwind CSS file
└── assets/
    └── images/         # Images and icons

## Key Changes

1. CSS Consolidation: All CSS converted to Tailwind and compiled into styles/main.css
2. Organized Pages: HTML files grouped by functionality
3. JavaScript Organization: Scripts categorized by purpose (components/services/utils)
4. Asset Management: All assets in dedicated folder

## Path Updates Required

All HTML files need updated references:
- CSS: link rel stylesheet href="../styles/main.css"
- Scripts: Adjust paths based on file location (../../scripts/...)
- Assets: ../assets/images/...

## Original CSS Files (Now Replaced)

- styles.css (4289 lines) converted to Tailwind components
- profile-styles.css (991 lines) converted to Tailwind utilities
- shared-ui.css (235 lines) converted to Tailwind utilities
- simulator-invest101.css (93 lines) converted to Tailwind utilities

All custom styles have been converted to Tailwind utility classes and custom components.
'@ -f (Get-Date)

Set-Content -Path "$targetDir\FILE_ORGANIZATION.md" -Value $mappingContent

Write-Host "`nOrganization Complete!" -ForegroundColor Green
Write-Host "Check the 'organized' folder for the new structure" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review organized files" -ForegroundColor White
Write-Host "  2. Update file paths in HTML files" -ForegroundColor White
Write-Host "  3. Replace old CSS links with Tailwind" -ForegroundColor White
Write-Host "  4. Test all pages" -ForegroundColor White
