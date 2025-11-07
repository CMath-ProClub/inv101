# Quick Reference: Batch Migration Template

This guide allows you to quickly migrate remaining files by following these patterns.

## Pattern 1: Simple Stylesheet Replacement

**For files that only need CSS link update:**

```bash
# Replace in all remaining calc-*.html and other files
OLD: <link rel="stylesheet" href="styles.css">
NEW: <link rel="stylesheet" href="dist/main.css">
```

**Using sed (Linux/Mac) or similar:**
```bash
find . -name "*.html" -exec sed -i 's|href="styles.css"|href="dist/main.css"|g' {} \;
find . -name "*.html" -exec sed -i 's|href="profile-styles.css"||g' {} \;
```

## Pattern 2: Layout Container Updates

For pages with `.app` + `.app__header` + `.app__content` + `.tabbar`:

```html
<!-- OLD STRUCTURE -->
<div class="app">
  <header class="app__header">
    <a class="link-button" href="back.html">Back</a>
  </header>
  <main class="app__content">
    <section class="feature-links feature-links--rows">
      <a href="page.html" class="feature-link--row">Link</a>
    </section>
  </main>
</div>
<nav class="tabbar" aria-label="Primary navigation">
  <a class="tabbar__btn" href="index.html">Main</a>
  <!-- ... -->
</nav>

<!-- NEW STRUCTURE (Tailwind) -->
<div class="flex min-h-screen flex-col">
  <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
    <a class="inline-flex items-center gap-2 rounded-full border border-primary-green bg-primary-green px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/40" href="back.html">Back</a>
  </header>
  <main class="flex-1 overflow-auto">
    <section class="space-y-3 px-6 py-4">
      <a href="page.html" class="flex flex-col rounded-xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-green/50 hover:bg-white hover:shadow-card dark:border-slate-800 dark:bg-slate-900/60">
        Link
      </a>
    </section>
  </main>
</div>
<nav class="fixed bottom-0 left-0 right-0 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Primary navigation">
  <a class="flex-1 flex flex-col items-center justify-center gap-1 border-r border-slate-200 px-2 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-primary-green dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-primary-green" href="index.html">Main</a>
  <!-- ... -->
</nav>
```

## Pattern 3: Component Class Mappings

Quick replace map for common classes:

| Old Class | New Tailwind |
|-----------|-------------|
| `.link-button` | `inline-flex items-center gap-2 rounded-full border border-primary-green bg-primary-green px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/40` |
| `.feature-link--row` | `flex flex-col rounded-xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-green/50 hover:bg-white hover:shadow-card dark:border-slate-800 dark:bg-slate-900/60` |
| `.tabbar__btn` | `flex-1 flex flex-col items-center justify-center gap-1 border-r border-slate-200 px-2 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-primary-green dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-primary-green` |
| `.icon.icon--tab` | `h-6 w-6` |
| `.test-card` | `rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-card transition hover:-translate-y-1 hover:border-primary-green/50 hover:shadow-card-hover dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-900/60` |
| `.demo-button` (inactive) | `inline-flex items-center gap-2 rounded-xl border-2 border-primary-green bg-white px-6 py-3 font-semibold text-primary-green shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:border-primary-green/60 dark:bg-slate-900 dark:text-primary-green` |
| `.demo-button.active` | `inline-flex items-center gap-2 rounded-xl border-2 border-primary-green bg-primary-green px-6 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg` |
| `.stats` | `grid gap-6 sm:grid-cols-2 lg:grid-cols-4` |
| `.stat-box` | `rounded-2xl bg-gradient-to-br from-primary-green to-emerald-600 p-6 text-center text-white shadow-lg` |

## Pattern 4: Grid Layouts

Responsive grids by use case:

```html
<!-- 2-column (tablets/desktop) -->
<div class="grid gap-6 sm:grid-cols-2">...</div>

<!-- 3-column (desktop) -->
<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">...</div>

<!-- 4-column (wide screens) -->
<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">...</div>

<!-- Auto-fit responsive -->
<div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">...</div>
```

## Pattern 5: Dark Mode

All elements should include dark variants:

```html
<!-- Light mode (default) / Dark mode (with 'dark:' prefix) -->
<div class="bg-white dark:bg-slate-900">
  <h1 class="text-slate-900 dark:text-white">Title</h1>
  <p class="text-slate-600 dark:text-slate-300">Subtitle</p>
</div>
```

## Pattern 6: Spacing & Sizing

Common Tailwind utilities used:

```html
<!-- Padding -->
<div class="px-6 py-4">...</div>          <!-- 24px horizontal, 16px vertical -->
<div class="p-5">...</div>                <!-- 20px all sides -->
<div class="p-4">...</div>                <!-- 16px all sides -->

<!-- Margins -->
<div class="mt-2 mb-4">...</div>          <!-- margin-top: 8px, margin-bottom: 16px -->
<div class="gap-3">...</div>              <!-- flex/grid gap: 12px -->

<!-- Sizing -->
<div class="h-6 w-6">...</div>            <!-- height/width: 24px -->
<div class="w-full">...</div>             <!-- width: 100% -->
<div class="max-w-6xl">...</div>          <!-- max-width: 1152px -->
```

## Files Ready to Batch Migrate

### Calc Pages (26 files) - Use calc-asset.html Template
All follow same pattern: header + content + tabbar nav

### Core Pages (5 files) - Require Careful Testing
1. index.html (home/dashboard)
2. simulator.html (market simulator)
3. lessons.html (course hub)
4. calculators.html (calculator index)
5. profile.html (user profile)

### Auth Pages (2 files) - May Have Custom Forms
1. signin.html
2. signup.html

### Analysis Pages (~30 files) - Mostly Content Pages
- market-analyzer.html
- stock-analysis.html
- stock-recommendations.html
- leaderboard.html
- friends.html
- politician-portfolio.html
- And others

---

## Automated Migration Script (PowerShell Example)

```powershell
# Migrate all remaining HTML files in batch
$files = Get-ChildItem '.\prototype\*.html' | Where-Object { $_.Name -notmatch '(404|achievements|activity|ai-toolkit|button-test|calc-asset)' }

foreach ($file in $files) {
    Write-Host "Migrating: $($file.Name)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Replace stylesheet
    $content = $content -replace 'href="styles\.css"', 'href="dist/main.css"'
    $content = $content -replace 'href="profile-styles\.css"', ''
    
    # Replace body tag
    $content = $content -replace '<body>', '<body class="bg-white dark:bg-slate-950">'
    
    # Replace app layout
    $content = $content -replace 'class="app"', 'class="flex min-h-screen flex-col"'
    $content = $content -replace 'class="app__header"', 'class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900"'
    $content = $content -replace 'class="app__content"', 'class="flex-1 overflow-auto"'
    
    # Write back
    Set-Content $file.FullName -Value $content -Encoding UTF8
    Write-Host "✓ Done"
}
```

---

## Testing After Migration

After migrating files, test:

1. **Layout** - Page renders without layout breaks
2. **Colors** - Text is readable, buttons visible
3. **Responsive** - Works at 320px, 768px, 1920px
4. **Dark Mode** - Toggle dark mode, verify all colors
5. **Forms** - Any input fields work
6. **Navigation** - Links work, tabbar active state
7. **Interactivity** - Buttons, filters, modals work

---

## CSS Build Command

After making changes, rebuild CSS:

```bash
cd prototype
npm run build:css
```

This ensures all new Tailwind classes are included in dist/main.css

