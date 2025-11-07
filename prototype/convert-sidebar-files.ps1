$files = @(
    "calculators.html",
    "index.html", 
    "lessons.html",
    "lesson-instruments.html",
    "lesson-foundations.html",
    "lesson-market.html",
    "lesson-practical.html",
    "newsletter.html",
    "responsive-test.html",
    "simulation.html",
    "simulator.html"
)

Write-Host "Converting 11 files from old CSS class names to Tailwind..." -ForegroundColor Cyan

foreach ($file in $files) {
    $fullPath = ".\$file"
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "  $file not found" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "  Converting: $file... " -NoNewline
    
    $content = Get-Content $fullPath -Raw
    $original = $content
    
    $content = $content -replace 'class="sidebar"', 'class="flex min-h-screen flex-col"'
    $content = $content -replace 'class="sidebar__nav"', 'class="space-y-1 flex-1"'
    $content = $content -replace 'class="sidebar__btn', 'class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800'
    $content = $content -replace 'class="app__content', 'class="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900'
    $content = $content -replace 'class="app__header"', 'class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900"'
    $content = $content -replace 'class="tabbar"', 'class="fixed bottom-0 left-0 right-0 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"'
    $content = $content -replace 'class="tabbar__btn', 'class="flex-1 flex flex-col items-center justify-center gap-1 border-r border-slate-200 px-2 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-primary-green dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-primary-green'
    
    if ($content -ne $original) {
        Set-Content -Path $fullPath -Value $content -Encoding UTF8
        Write-Host "OK" -ForegroundColor Green
    }
    else {
        Write-Host "OK" -ForegroundColor Gray
    }
}

Write-Host "Conversion complete!" -ForegroundColor Green
