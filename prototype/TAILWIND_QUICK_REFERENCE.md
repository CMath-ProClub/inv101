# Tailwind CSS Quick Reference - Investing101

## 🎯 Quick Start

### Build Commands
```bash
npm run build:css   # Build once
npm run dev         # Watch for changes
```

### Link in HTML
```html
<link href="/dist/main.css" rel="stylesheet">
```

---

## 🎨 Custom Colors

Use these custom colors in your HTML:

| Color | Class | Hex |
|-------|-------|-----|
| Primary Green | `bg-primary-green` `text-primary-green` | #1dd1a1 |
| Primary Red | `bg-primary-red` `text-primary-red` | #ff3b5c |
| Primary Purple | `bg-primary-purple` `text-primary-purple` | #6c5ce7 |
| Primary Cyan | `bg-primary-cyan` `text-primary-cyan` | #00d4ff |
| Primary Yellow | `bg-primary-yellow` `text-primary-yellow` | #ffc15e |
| Primary Orange | `bg-primary-orange` `text-primary-orange` | #f7931a |

### Examples:
```html
<button class="bg-primary-green text-white">Click me</button>
<div class="border-2 border-primary-purple">...</div>
<h1 class="text-primary-red">Error!</h1>
```

---

## 🔲 Common Component Classes

### Buttons
```html
<!-- Primary Button -->
<button class="btn-primary">Save</button>

<!-- Secondary Button -->
<button class="btn-secondary">Cancel</button>

<!-- Danger Button -->
<button class="btn-danger">Delete</button>

<!-- Custom Button (using utilities) -->
<button class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Custom
</button>
```

### Cards
```html
<!-- Standard Card -->
<div class="card">
  <h2 class="text-xl font-bold mb-4">Title</h2>
  <p>Content goes here...</p>
</div>

<!-- Custom Card -->
<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
  Content
</div>
```

### Forms
```html
<!-- Form Input -->
<label class="form-label">Email</label>
<input type="email" class="form-input" placeholder="you@example.com">

<!-- Custom Input -->
<input class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green">
```

### Navigation
```html
<!-- Nav Link -->
<a href="#" class="nav-link">Home</a>
<a href="#" class="nav-link text-primary-green">Active</a>
```

### Progress Bars
```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 75%"></div>
</div>
```

### Badges
```html
<span class="badge bg-green-100 text-green-800">Success</span>
<span class="badge bg-red-100 text-red-800">Error</span>
<span class="badge bg-yellow-100 text-yellow-800">Warning</span>
```

### Alerts
```html
<div class="alert-success">Operation successful!</div>
<div class="alert-error">Something went wrong!</div>
```

---

## 📐 Layout Utilities

### Flexbox
```html
<!-- Flex Container -->
<div class="flex items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Flex Column -->
<div class="flex flex-col gap-2">
  <div>Top</div>
  <div>Bottom</div>
</div>
```

### Grid
```html
<!-- 3 Column Grid -->
<div class="grid grid-cols-3 gap-4">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>

<!-- Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

### Spacing
```html
<!-- Padding -->
<div class="p-4">All sides: 1rem</div>
<div class="px-6 py-3">Horizontal: 1.5rem, Vertical: 0.75rem</div>

<!-- Margin -->
<div class="m-4">All sides: 1rem</div>
<div class="mt-8 mb-4">Top: 2rem, Bottom: 1rem</div>

<!-- Gap -->
<div class="flex gap-4">Spacing between items</div>
```

---

## 🎭 Interactive States

### Hover
```html
<button class="bg-blue-500 hover:bg-blue-600">Hover me</button>
<div class="opacity-75 hover:opacity-100">Fade in on hover</div>
```

### Focus
```html
<input class="focus:ring-2 focus:ring-primary-green focus:outline-none">
```

### Active
```html
<button class="active:scale-95">Press me</button>
```

### Disabled
```html
<button class="disabled:opacity-50 disabled:cursor-not-allowed" disabled>
  Disabled
</button>
```

---

## 🌙 Dark Mode

Add `dark:` prefix for dark mode styles:

```html
<!-- Background -->
<div class="bg-white dark:bg-gray-800">
  <!-- Text -->
  <h1 class="text-gray-900 dark:text-white">Title</h1>
  <p class="text-gray-600 dark:text-gray-300">Content</p>
</div>

<!-- Borders -->
<div class="border border-gray-200 dark:border-gray-700">...</div>
```

### Enable Dark Mode
```html
<!-- Add class to <html> -->
<html class="dark">
<!-- or use JavaScript -->
<script>
document.documentElement.classList.toggle('dark');
</script>
```

---

## 📱 Responsive Design

Use breakpoint prefixes:

| Breakpoint | Prefix | Min Width |
|------------|--------|-----------|
| Mobile | (none) | 0px |
| Small | `sm:` | 640px |
| Medium | `md:` | 768px |
| Large | `lg:` | 1024px |
| XL | `xl:` | 1280px |
| 2XL | `2xl:` | 1536px |

### Examples:
```html
<!-- Hide on mobile, show on desktop -->
<div class="hidden lg:block">Desktop only</div>

<!-- Stack on mobile, row on desktop -->
<div class="flex flex-col lg:flex-row">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Responsive text size -->
<h1 class="text-2xl md:text-4xl lg:text-6xl">Responsive Heading</h1>

<!-- Responsive padding -->
<div class="p-4 lg:p-8">More padding on large screens</div>
```

---

## ✨ Common Patterns

### Hero Section
```html
<section class="bg-gradient-to-r from-primary-green to-primary-cyan text-white py-20">
  <div class="container mx-auto px-4">
    <h1 class="text-5xl font-bold mb-4">Welcome to Investing101</h1>
    <p class="text-xl mb-8">Learn to invest wisely</p>
    <button class="btn-primary">Get Started</button>
  </div>
</section>
```

### Modal
```html
<!-- Backdrop -->
<div class="modal-backdrop">
  <!-- Modal -->
  <div class="modal-content">
    <div class="flex items-center justify-between p-6 border-b">
      <h2 class="text-2xl font-bold">Modal Title</h2>
      <button class="text-gray-500 hover:text-gray-700">&times;</button>
    </div>
    <div class="p-6">
      Modal content here...
    </div>
    <div class="flex justify-end gap-3 p-6 border-t">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Card with Gradient
```html
<div class="relative overflow-hidden bg-gradient-to-br from-primary-green/10 to-primary-green/5 rounded-xl p-6">
  <h3 class="text-xl font-bold mb-2">Calculator Title</h3>
  <p class="text-gray-600">Description...</p>
</div>
```

### Loading Spinner
```html
<div class="flex items-center justify-center">
  <div class="w-8 h-8 border-4 border-gray-300 border-t-primary-green rounded-full animate-spin"></div>
</div>
```

### Table
```html
<table class="w-full">
  <thead class="bg-gray-100 dark:bg-gray-800">
    <tr>
      <th class="px-6 py-3 text-left text-sm font-semibold">Name</th>
      <th class="px-6 py-3 text-left text-sm font-semibold">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td class="px-6 py-4 border-b">Item 1</td>
      <td class="px-6 py-4 border-b">$100</td>
    </tr>
  </tbody>
</table>
```

---

## 🔧 Arbitrary Values

For one-off values:

```html
<!-- Custom spacing -->
<div class="top-[117px]">Specific position</div>

<!-- Custom color -->
<div class="bg-[#bada55]">Custom hex color</div>

<!-- Custom size -->
<div class="w-[347px]">Exact width</div>

<!-- Using CSS variables -->
<div class="bg-[var(--custom-color)]">From CSS variable</div>
```

---

## 🎯 Migration Cheat Sheet

### Old CSS → New Tailwind

| Old CSS | New Tailwind |
|---------|-------------|
| `display: flex;` | `class="flex"` |
| `justify-content: space-between;` | `class="justify-between"` |
| `align-items: center;` | `class="items-center"` |
| `padding: 1rem;` | `class="p-4"` |
| `margin-top: 2rem;` | `class="mt-8"` |
| `background-color: #1dd1a1;` | `class="bg-primary-green"` |
| `color: white;` | `class="text-white"` |
| `border-radius: 0.5rem;` | `class="rounded-lg"` |
| `font-weight: bold;` | `class="font-bold"` |
| `text-align: center;` | `class="text-center"` |

---

## 📚 Resources

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Play CDN** (for testing): https://play.tailwindcss.com
- **Cheat Sheet**: https://nerdcave.com/tailwind-cheat-sheet
- **VS Code Extension**: Tailwind CSS IntelliSense

---

## 💡 Pro Tips

1. **Use the VS Code extension** - Get autocomplete for all Tailwind classes
2. **Group related utilities** - Keep similar styles together for readability
3. **Extract components** - If you're repeating the same classes 3+ times, consider making it a component
4. **Mobile-first** - Write base styles for mobile, then add `lg:` for desktop
5. **Use arbitrary values sparingly** - Try to stick to theme values when possible
6. **Dark mode is easy** - Just add `dark:` prefix to any utility
7. **Combine with custom CSS** - It's okay to write custom CSS for truly unique cases

---

**Need Help?** Check the full [Migration Plan](TAILWIND_MIGRATION_PLAN.md) for detailed guidance.
