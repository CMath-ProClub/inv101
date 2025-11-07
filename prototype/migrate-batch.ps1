$alreadyMigrated = @('404.html', 'achievements.html', 'activity-feed.html', 'ai-toolkit.html', 'button-test-dashboard.html', 'calc-asset.html')
$files = Get-ChildItem '*.html' | Where-Object { $_.Name -notin $alreadyMigrated -and $_.Name -notmatch 'backup' }

Write-Host "`n=== Tailwind CSS Batch Migration ===" -ForegroundColor Cyan
Write-Host "Files to migrate: $($files.Count)" -ForegroundColor Green

$success = 0
$skip = 0

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)... " -NoNewline
    $content = Get-Content $file.FullName -Raw
    $orig = $content
    
    $content = $content -replace 'href="styles\.css"', 'href="dist/main.css"'
    $content = $content -replace 'href="profile-styles\.css"', 'href="dist/main.css"'
    $content = $content -replace 'href="shared-ui\.css"', 'href="dist/main.css"'
    $content = $content -replace 'href="simulator-invest101\.css"', 'href="dist/main.css"'
    $content = $content -replace '<body>', '<body class="bg-white dark:bg-slate-950">'
    $content = $content -replace 'class="app"', 'class="flex min-h-screen flex-col"'
    $content = $content -replace 'class="app__header"', 'class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900"'
    $content = $content -replace 'class="app__content"', 'class="flex-1 overflow-auto"'
    $content = $content -replace 'class="tabbar"', 'class="fixed bottom-0 left-0 right-0 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"'
    $content = $content -replace 'class="tabbar__btn', 'class="flex-1 flex flex-col items-center justify-center gap-1 border-r border-slate-200 px-2 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-primary-green dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-primary-green'
    
    if ($content -ne $orig) {
        Set-Content $file.FullName $content -Encoding UTF8
        Write-Host "Done" -ForegroundColor Green
        $success++
    } else {
        Write-Host "Skip" -ForegroundColor Gray
        $skip++
    }
}

Write-Host "`n=== Complete ===" -ForegroundColor Cyan
Write-Host "Migrated: $success | Skipped: $skip" -ForegroundColor Green
