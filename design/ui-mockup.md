# Mobile App UI Mockup – Inv101

## Design Principles
- Modern, approachable interface mirroring Chess.com and Duolingo clarity
- Progressive disclosure keeps newcomers focused on core actions
- Soft card shadows, rounded corners, light neutral palette with accent green/teal for actions
- Consistent iconography and simple typography (e.g., Inter or SF Pro)

## Global Elements
- **Top Status Bar**: Time, signal, battery
- **Header Strip**: App logo (render `Investing101.png`), bell icon for alerts, subtle progress dots for tutorial walkthrough
- **Bottom Tab Bar**: Five evenly spaced icons + labels, active tab highlighted with filled icon and accent color underline

## Monetization & Access Tiers
- **Rookie (Free)**: 50 scraped articles, 5 stock recommendations, 5-stock vs S&P 500 comparison, $10K simulator funds with 10 purchase actions (2 saves), 1 AI round per week, 1 daily lesson/quiz (terminology lesson free), CORE calculators, access to Market Analyzer previews.
- **Scholar ($7.99/mo)**: All lessons, all calculators, 5 AI rounds per week, extended lesson attempts (3 per day with 5 total tries), access to education personas in Beat the AI including historical scenarios.
- **Analyst ($9.99/mo)**: 150+ articles, 3 full stock analyses, 15 recommendations, 15-stock comparisons, politician portfolio weekly update, $50K simulator (25 actions, 5 saves + 1 shared portfolio), CORE/RISK/CRYPTO calculators, 5 AI rounds per week, 3 daily lessons with 5 attempts.
- **Strategist ($24.99/mo)**: 300+ articles, 10 stock deep dives, 50 recommendations, 50+ comparisons, politician portfolio + push alerts, $100K simulator (100 actions, 15 saves + 3 shared portfolios), unlimited AI rounds, unlimited lessons/attempts, all calculators unlocked by default.
- **Add-on**: Calculator unlock pass ($5) grants full calculator access for non-subscribers; ad-based temporary unlocks available (see Ads section).

```
 -------------------------------------------------
| LOGO      |                |  🔔  |
|-----------------------------------------------|
|                                               |
|                Screen Content                 |
|                                               |
|                                               |
|                                               |
|-----------------------------------------------|
|  🏠 Main  | 🎯 Sim/AI | 📘 Lessons | 🧮 Calc | 😀 Profile |
 -------------------------------------------------
```

## First-Visit Tutorial Overlay
- Semi-transparent layer highlighting each tab sequentially
- Tooltip copy: "Tap Main to explore featured tools" / "Simulator lets you test strategies" / etc.
- Progress dots in header show onboarding step count

---

## Screen 1 – Home (Main Features)
**Purpose**: welcome, sign-in/up, snapshot of key features with availability statuses.

```
[Logo centered from `Investing101.png`]
"Invest Smarter, Start Confidently"

[Sign In Button]  [Create Account Ghost Button]
[Continue as Guest Link]

---
"Today’s Highlights"
[Card] Market Analyzer (Unlocked) – small chart thumbnail, CTA "Open"
[Card] Stock Recommendations (Locked icon) – label "Unlock in 12:45"
[Card] Play the AI (Unlocked) – shows next attempt counter
[Card] Lessons (Unlocked) – progress badge "3 of 5"

"Quick Progress"
[Horizontal chips] Rookie Level • Streak 2 • Next Lesson ETA
```

- Locked items show greyed-out card with lock icon and countdown timer chip
- Swiping down reveals full list of main features in stacked cards
- Pull-to-refresh animates subtle ripple

### Interactions
- Tapping an unlocked card opens feature modal
- Locked cards present upsell sheet (brief description + upgrade CTA)
- Highlighted tooltip anchors on first visit guiding action

### Tier-Specific Home Treatments
- Rookie sees upsell band under highlights with quick comparison chips (`Scholar • Analyst • Strategist`).
- Scholar/Analyst/Strategist show tier badge, benefits summary, and progress toward next tier perks.
- On free tier, locked cards surface contextual copy (e.g., "Upgrade to Analyst for full stock analysis") and offer ad-based temporary unlock where applicable.

---

## Screen 2 – Simulator & Beat the AI
**Purpose**: combine simulator access and AI challenge roster.

```
"Simulator"
[Segmented control] Simulator | Beat the AI

// Simulator tab
[Balance Card] $10,000 Practice Funds • Trades left: 10/10 • Buttons: "Resume" / "New Challenge"
[Challenge Carousel] Daily Challenge | Trend Tracker | Risk-Off Run
[Leaderboard Preview] Top 3 avatars with gain %
[Info Chip] "Upgrade for more assets"

// Beat the AI tab
[Persona Cards in grid]
┌ Coach Rookie (Free) ┐   ┌ Analyst Ava (Locked) ┐
| Difficulty: Easy     |  | Requires Scholar     |
| Last played: 1d ago  |  | Rewards: +XP         |
└ [Play] button        ┘  └ [Unlock] button      ┘
[Upcoming Landmark Era Banner] "Black Monday 1987" (Strategist)
```

- Lock badges on premium personas with small paywall tooltip
- Switching tabs animates content slide

### Interactions
- "Resume" opens saved simulation state selector (max 2 files for Rookie)
- Locked personas trigger subscription modal with tier comparison snippet
- Long-press persona reveals brief strategy description
- Scholar+ can select curated historical eras (e.g., 2008 crisis) via filter chips; Strategist gets AI persona voiceover and unlimited retries.

---

## Screen 3 – Lessons
**Purpose**: structured learning path with mix of lessons, quizzes, puzzles.

```
"Learning Path"
[Progress path] Foundations → Instruments → Practical → Market
Nodes styled as rounded rectangles with icon badges

"Daily Lesson"
[Card] Title, duration (10 min), streak badge, CTA "Start"

"Skill Puzzles"
[Carousel] Flashcards | Scenario Quiz | Mini Case Study
Each tile shows type icon, difficulty dots (1-3), attempts left

"Refreshers"
[List] Topics needing review with "Quick 3-question quiz" button
```

- Colors differentiate content types (blue for lessons, orange for quizzes, purple for puzzles)
- Challenge limit indicator (e.g., "Attempts left today: 1/3") shown on card corner

### Interactions
- Tapping path node reveals module breakdown (lessons, quizzes, estimated time)
- Completed modules display checkmark and XP earned
- Locked advanced modules show upgrade prompt with preview description
- Scholar tier unlocks all lessons, Analyst gets 3 daily lessons with 5 attempts, Strategist removes caps; ad button offers one extra attempt per day for lower tiers.

---

## Screen 4 – Calculators
**Purpose**: quick access to categorized financial calculators.

```
[Search bar] "Search calculators"

Category chips (scrollable): CORE • RISK • STOCK • ASSET • RETIRE • TAX • CRYPTO

[Calculator list in cards]
┌ Compound Interest ┐   ┌ Annualized Return ┐
| CORE              |   | CORE              |
| Icon + short blurb|   | Icon + blurb      |
└ [Open]            ┘   └ [Open]            ┘

[Locked Ribbon] CRYPTO calculators (Analyst+)
Greyed cards with lock, CTA "Preview"
```

- Cards contain minimal inputs preview (e.g., base fields) but open full modal when tapped
- Floating action button "Favorites" opens saved calculator shortcuts
- Rookie default access: CORE; Analyst adds RISK + CRYPTO; Strategist unlocks all plus advanced widgets (ASSET, RETIRE, TAX, STOCK).

### Interactions
- Search filters list live
- Upsell modal for locked calculators includes example output snapshot
- Swipe left on card to favorite/unfavorite
- Watch-ad CTA grants 15-minute unlock for a selected calculator (tracked via countdown chip on card).

---

## Screen 5 – Profile
**Purpose**: personal settings, subscription status, avatar progression.

```
[Avatar circle] Tap to edit → choose from badge-driven options
[Username] • [Current Tier Badge]
[Progress bar] XP to next title (Rookie → Scholar → Analyst → Strategist)

"Account"
[List] Subscription plan, Payment methods, Manage notifications

"Performance"
[List] Simulator stats, Lesson streak, AI wins

"Preferences"
[Toggles] Dark mode, Data saver, Push alerts

"Support"
[List] Help center, Contact, Legal

[Sign Out button]
```

- Tier badge design echoes Chess.com rank shields
- Progress bar uses gradient accent color reflecting advancement

### Interactions
- Editing avatar opens modal with earned/unlocked outfits based on badges
- Subscription list item opens tier comparison and manage plan actions
- Tier card displays benefits summary and next billing date; ad preferences toggle controls reward videos.

---

## Bottom Tab Icons & Labels
- `🏠 Main`
- `🎯 Sim/AI`
- `📘 Lessons`
- `🧮 Calc`
- `😀 Profile`

Icons can be replaced with custom line icons keeping same semantics.

---

## Tutorial Flow Example
1. Welcome modal overlays Home with "Let’s take a quick tour" CTA.
2. Highlights Main tab cards with descriptive tooltip.
3. Guides user to swipe toward Simulator tab, shows persona preview.
4. Lessons tab tooltip explains difficulty badges and streaks.
5. Calculators tab overlay demonstrates category chips.
6. Profile tab highlight ends tour with "Customize your path" CTA.
7. On completion, onboarding quiz prompt appears.

---

## Feature Specs

### Market Analyzer
- Aggregates scrapes across 50/150/300+ credible sources depending on tier; shows YTD, 30D, 7D, 24H bands with projection deltas.
- Past vs projected cards surface AI predictions (24H/7D/30D) with confidence grades 1–100; top-performing stocks bubble to top via weighted growth scoring.
- Tags (e.g., "Outperforming Sector", "Volatile This Week") appear as colored pills; tap for mini tooltip explanation.

### Specific Stock Analysis
- Deep dives synthesize multi-source sentiment (target 50 sources per stock) with layered tone-over-time graph highlighting bullish/neutral/bear shifts.
- Analyst+ unlocks full report export; Rookie sees key insights with upgrade gate on detailed risk breakdown.

### Stock Recommendations
- Mirrors analyzer visuals but filtered to top prospects; includes "Why this stock?" bullet list summarizing AI logic.
- Backtesting view lets users replay historical recommendations; Strategist tier can adjust filters by time, sector, risk.

### S&P 500 Comparison
- Users input benchmark (e.g., Dow, S&P 500) and up to 5/15/50 stocks based on tier; overlay chart shows performance, volatility, 1Y return, Sharpe Ratio.
- Export snapshot available to Analyst+.

### Politician Portfolio
- Tracks congressional trades; Rookie preview limited, Analyst gets weekly pull, Strategist receives push alerts until tracked official is changed.
- Each trade entry includes context note and automatic S&P comparison chip.

### Market Simulation
- Powered by live Google Finance feeds; tier determines portfolio size, action limit, stock universe (top 10 → 25 → 100+) and shared save slots.
- Challenge Mode offers time-bound missions (e.g., "Double in 2 months"), displays leaderboard and shareable invite link.

### Play the AI
- Uses historical market data (up to 40 years) to simulate sessions; difficulty tied to AI persona strategy and risk appetite.
- Scholar unlocks curated events (e.g., 2008 crisis), Strategist gets persona voice commentary, end-of-round analysis, and unlimited plays.
- "Share the Seed" button copies session ID to challenge friends.

### Calculators
- Categories: CORE, RISK, STOCK, ASSET, RETIRE, TAX, CRYPTO; non-subscribers can purchase $5 full unlock or watch ads for 15-minute access.
- Favorites list syncs across devices; Strategist tier gains batch compare mode for advanced planning.

### Educational Lessons
- Path: Foundations → Instruments & Accounts → Practical Investing → Market Understanding.
- Onboarding quiz assigns difficulty and importance ratings; lessons combine video, interactive practice, and AI-powered recap.
- Idle users receive prompt for free refresher modules.

### Badge System
- Streaks, achievements (e.g., "Beat the Market", "Investing101 Graduate"), and title progression (Rookie → Scholar → Analyst → Strategist → Wall Street Official).
- Badges unlock avatar cosmetics and occasional calculator passes.

### Newsletter
- "Today’s Top 5 Stocks" daily email with top gainers, one underperformer, and optional ads; sign-up toggle located in Profile > Preferences.

## Advertisements & Rewards
- Lessons: watch ad for one extra quiz life per day (tracks via timer badge on lesson cards).
- Market Simulation: ads grant +5% starting funds or one "Revert to last purchase" token per round.
- Beat the AI: ad stuns AI for 4 in-game hours, once per simulated week.
- Calculators: ads unlock chosen calculator for 15 minutes, timer shown atop card.
- Ads are optional; Profile > Preferences offers toggle to opt out for paid tiers.

## Visual Tone
- Light background (#F6F8FB) with dark text (#1F2A37)
- Accent: Emerald/Teal (#1DD1A1) for CTAs, golden highlight (#FFC048) for achievements
- Use rounded 12–16px cards, subtle shadow (0,4,16,rgba(31,42,55,0.12))
- Motion: 200–250ms ease-out transitions, scale-up on card tap

## Accessibility
- Minimum 4.5:1 contrast for text
- Large hit targets (44px min)
- Optional text-to-speech for lessons

## Next Steps
- Create high-fidelity mockups with chosen color palette
- Prototype onboarding tour interactions in design tool
- Validate tab copy and icons with user testing
