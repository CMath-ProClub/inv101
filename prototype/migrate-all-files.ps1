# Enhanced Tailwind CSS Batch Migration Script
# Migrates all HTML files from legacy CSS to Tailwind
# Skips files already migrated

$prototypeDir = Get-Location
$alreadyMigrated = @(
    '404.html',
    'achievements.html',
    'activity-feed.html',
    'ai-toolkit.html',
    'button-test-dashboard.html',
    'calc-asset.html'
)

# Get all HTML files
$allFiles = Get-ChildItem '*.html' | Where-Object { $_.Name -notmatch 'backup|test' }
$filesToMigrate = $allFiles | Where-Object { $_.Name -notin $alreadyMigrated }

Write-Host "`n=== Tailwind CSS Batch Migration ===" -ForegroundColor Cyan
Write-Host "Found $($filesToMigrate.Count) files to migrate" -ForegroundColor Green
Write-Host "Skipping $($alreadyMigrated.Count) already-migrated files`n" -ForegroundColor Yellow

$successCount = 0
$errorCount = 0

foreach ($file in $filesToMigrate) {
    try {
        Write-Host "Migrating: $($file.Name)... " -NoNewline -ForegroundColor Cyan
        
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Replace all stylesheet links to old CSS files with Tailwind
        $content = $content -replace 'href="styles\.css"', 'href="dist/main.css"'
        $content = $content -replace 'href="profile-styles\.css"', 'href="dist/main.css"'
        $content = $content -replace 'href="shared-ui\.css"', 'href="dist/main.css"'
        $content = $content -replace 'href="simulator-invest101\.css"', 'href="dist/main.css"'
        
        # Add proper background classes to body tag
        $content = $content -replace '<body>', '<body class="bg-white dark:bg-slate-950">'
        
        # Replace layout container classes
        $content = $content -replace 'class="app"', 'class="flex min-h-screen flex-col"'
        $content = $content -replace 'class="app__header"', 'class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900"'
        $content = $content -replace 'class="app__content"', 'class="flex-1 overflow-auto"'
        
        # Replace tabbar navigation
        $content = $content -replace 'class="tabbar"', 'class="fixed bottom-0 left-0 right-0 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"'
        $content = $content -replace 'class="tabbar__btn', 'class="flex-1 flex flex-col items-center justify-center gap-1 border-r border-slate-200 px-2 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-primary-green dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-primary-green'
        
        # Write if content changed
        if ($content -ne $originalContent) {
            Set-Content $file.FullName -Value $content -Encoding UTF8
            Write-Host "✓ Done" -ForegroundColor Green
            $successCount++
        }
        else {
            Write-Host "⊘ No changes" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "✗ ERROR: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n=== Migration Summary ===" -ForegroundColor Cyan
Write-Host "✓ Successfully migrated: $successCount files" -ForegroundColor Green
Write-Host "✗ Errors: $errorCount files" -ForegroundColor $(if ($errorCount -gt 0) { 'Red' } else { 'Green' })
Write-Host "`nNext step: Run 'npm run build:css' to rebuild Tailwind CSS" -ForegroundColor Yellow
