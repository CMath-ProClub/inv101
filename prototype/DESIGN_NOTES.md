Design notes — shared UI updates

Summary
- Added a centralized SVG sprite at `prototype/assets/icons.svg` and updated `prototype/shared-ui.js` to use it for header/tabbar/sidebar icons.
- Polished `prototype/shared-ui.css` to improve typography, touch targets, chip/button styles, card appearance, and header spacing to better match the `design/ui-mockup.md` direction (chess.com / Duolingo-inspired compact feel).
- Ensured `device-detection.js` is present early in the head of key pages so the shared UI initializes before content paint (reduces layout shift).

Key style tokens
- --accent: #1DD1A1
- --accent-strong: #18b38f
- --bg: #F6F8FB
- --bg-card: #FFFFFF
- --muted: #F1F5F9
- --border: rgba(31,42,55,0.06)
- --text: #1F2A37
- --text-muted: #6B7785

Notable components
- Header
  - Sticky, slightly increased horizontal padding
  - Icon buttons are at least 44×44 to meet touch target guidelines
  - `img.app__logo` links to `index.html` (in JS) and has consistent sizing

- Tabbar (mobile)
  - Fixed to bottom, 60px height, touch-friendly spacing, subtle shadow

- Sidebar (desktop)
  - Fixed left with 88px width; sidebar buttons show an icon + small label

- Cards and buttons
  - `card` uses white background, subtle border and shadow, 12px radius
  - Primary/secondary button tokens added for quick reuse

How to review locally
1. Open `prototype/index.html` in a browser (serve the folder or open file directly). The shared UI is injected by `device-detection.js` which loads `shared-ui.css` and `shared-ui.js`.
2. Test mobile view (responsive dev tools) to ensure the bottom tabbar appears and the sidebar is hidden.
3. Test desktop width to ensure sidebar appears and tabbar hidden.
4. Confirm header logo navigates to `index.html`.

Testing and next steps
- I recommend doing a visual regression check (screenshots) for a handful of pages: `index.html`, `calculators.html`, `simulator.html`, `market-analyzer.html`, and one calculator page (e.g., `calc-core.html`). A small Playwright script can automate this.
- Optionally remove duplicate static nav markup from pages now that the shared UI injects header/sidebar/tabbar. (This is low-risk but needs manual review per page.)

How to revert
- Revert `prototype/shared-ui.css`, `prototype/shared-ui.js`, and `prototype/assets/icons.svg` to previous versions or use git to checkout earlier commits.

Contact
- If you want exact pixel parity with `design/ui-mockup.md`, tell me which pages to prioritize and I'll iterate further (fonts, weights, spacing, and icon micro-adjustments).