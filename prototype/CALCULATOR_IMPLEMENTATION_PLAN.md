# Complete Calculator Implementation Plan

## Status Overview

### ✅ COMPLETED
1. **calc-core-compound.html** - Compound Interest Calculator (FULLY FUNCTIONAL)
2. **calc-tax-capitalgains.html** - Capital Gains Tax Calculator (FULLY FUNCTIONAL)
3. **calc-core.html** - CORE category page with navigation
4. **calc-tax.html** - TAX category page with navigation

### 📋 REMAINING TO CREATE

## CORE Calculators (4 more needed)

### calc-core-roi.html - ROI Calculator
**Inputs:**
- Initial Investment ($)
- Final Value ($)
- Time Period (optional, for annualized ROI)

**Formula:** ROI = (Final Value - Initial Investment) / Initial Investment × 100%

---

### calc-core-annualized.html - Annualized Return Calculator
**Inputs:**
- Beginning Value ($)
- Ending Value ($)
- Number of Years

**Formula:** Annualized Return = ((Ending Value / Beginning Value)^(1/Years) - 1) × 100%

---

### calc-core-riskreward.html - Risk/Reward Ratio Calculator
**Inputs:**
- Entry Price ($)
- Target Price ($)
- Stop Loss Price ($)

**Formula:** Risk/Reward Ratio = (Target Price - Entry Price) / (Entry Price - Stop Loss Price)

**Output:** Display ratio (e.g., 1:3 means risk $1 to make $3)

---

### calc-core-volatility.html - Volatility Calculator
**Inputs:**
- Price data points (comma-separated or textarea)
- Time period selection (daily, weekly, monthly)

**Formula:** 
1. Calculate returns: (Price[i] - Price[i-1]) / Price[i-1]
2. Standard Deviation of returns
3. Annualized Volatility = Standard Deviation × √(252 for daily, 52 for weekly, 12 for monthly)

---

## RISK Calculators (3 needed)

### calc-risk-kelly.html - Kelly Criterion Calculator
**Inputs:**
- Win Probability (%)
- Win/Loss Ratio (how much you win vs lose)
- Current Bankroll ($)

**Formula:** Kelly % = (Win Probability × Win/Loss Ratio - Loss Probability) / Win/Loss Ratio

**Output:** Optimal position size in $ and %

---

### calc-risk-position.html - Position Size / Fixed Fractional Calculator
**Inputs:**
- Account Size ($)
- Risk per Trade (%)
- Entry Price ($)
- Stop Loss Price ($)

**Formula:** Position Size = (Account Size × Risk%) / (Entry Price - Stop Loss Price)

**Output:** Number of shares/units to buy

---

### calc-risk-var.html - Portfolio Value at Risk (VaR) Calculator
**Inputs:**
- Portfolio Value ($)
- Expected Return (%)
- Standard Deviation / Volatility (%)
- Confidence Level (90%, 95%, 99%)
- Time Horizon (days)

**Formula:** VaR = Portfolio Value × (Expected Return - (Z-score × Volatility × √Time))

**Output:** Maximum expected loss at given confidence level

---

## STOCK Calculators (4 needed)

### calc-stock-pe.html - P/E Ratio Calculator
**Inputs:**
- Current Stock Price ($)
- Earnings Per Share (EPS) ($)

**Formula:** P/E Ratio = Stock Price / EPS

**Output:** P/E ratio with interpretation (overvalued/undervalued based on industry average input)

---

### calc-stock-intrinsic.html - Intrinsic Value (DCF) Calculator
**Inputs:**
- Free Cash Flow ($)
- Growth Rate (%)
- Discount Rate / WACC (%)
- Terminal Growth Rate (%)
- Number of Years to Project

**Formula:** DCF with terminal value calculation

**Output:** Intrinsic value per share, comparison to current price

---

### calc-stock-divyield.html - Dividend Yield Calculator
**Inputs:**
- Annual Dividend Per Share ($)
- Current Stock Price ($)

**Formula:** Dividend Yield = (Annual Dividend / Stock Price) × 100%

**Output:** Yield %, annual income from X shares

---

### calc-stock-divgrowth.html - Dividend Growth Calculator
**Inputs:**
- Current Dividend ($)
- Dividend Growth Rate (%)
- Number of Years
- Number of Shares Owned

**Formula:** Future Dividend = Current Dividend × (1 + Growth Rate)^Years

**Output:** Future dividend, total income over time

---

## ASSET Calculators (2 needed)

### calc-asset-allocation.html - Asset Allocation Rebalancer
**Inputs:**
- Current Portfolio Values (Stocks $, Bonds $, Real Estate $, Cash $)
- Target Allocation (%, %, %, %)

**Formula:** Calculate difference between current and target, show how much to buy/sell

**Output:** Rebalancing actions needed for each asset class

---

### calc-asset-mpt.html - Modern Portfolio Theory Optimizer
**Inputs:**
- Assets with expected returns (%)
- Assets with volatilities (%)
- Correlation coefficients between assets
- Risk tolerance (1-10)

**Formula:** Calculate efficient frontier, optimal portfolio weights

**Output:** Recommended allocation percentages for maximum Sharpe ratio

---

## RETIRE Calculators (2 needed)

### calc-retire-savings.html - Retirement Savings Calculator
**Inputs:**
- Current Age
- Retirement Age
- Current Savings ($)
- Monthly Contribution ($)
- Expected Annual Return (%)
- Desired Retirement Income ($ per year)

**Formula:** Future value calculation + sustainability calculation

**Output:** Projected retirement savings, sustainability years

---

### calc-retire-401k.html - 401(k) Growth Calculator
**Inputs:**
- Current 401(k) Balance ($)
- Annual Contribution ($)
- Employer Match (%)
- Match Limit (%)
- Expected Return (%)
- Years Until Retirement

**Formula:** FV with employer match included

**Output:** Total at retirement, employer contribution total

---

## TAX Calculators (1 more needed)

### calc-tax-netprofit.html - Net Profit After Tax Calculator
**Inputs:**
- Gross Profit ($)
- Tax Rate (%) or Filing Status for calculation
- Business Expenses (optional, $)

**Formula:** Net Profit = Gross Profit - Business Expenses - (Taxable Income × Tax Rate)

**Output:** Net profit, effective tax rate, tax owed

---

## CRYPTO Calculators (2 needed)

### calc-crypto-staking.html - Crypto Staking Yield Calculator
**Inputs:**
- Staked Amount ($)
- APY / Staking Rewards (%)
- Staking Period (months)
- Compounding Frequency

**Formula:** Compound interest with crypto-specific considerations

**Output:** Total rewards, future value

---

### calc-crypto-mining.html - Crypto Mining Profitability Calculator
**Inputs:**
- Hash Rate (TH/s)
- Power Consumption (Watts)
- Electricity Cost ($ per kWh)
- Mining Difficulty
- Block Reward
- Pool Fee (%)
- Crypto Price ($)

**Formula:** Daily Revenue - Daily Electricity Cost - Pool Fees

**Output:** Daily, monthly, yearly profit; break-even time

---

## Implementation Pattern

Each calculator file should follow this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Calculator Name]</title>
  <link rel="stylesheet" href="styles.css">
  <script>
    if (localStorage.getItem('darkMode') === 'true') { 
      document.documentElement.classList.add('dark-mode-loading'); 
    }
  </script>
</head>
<body>
  <script>
    if (localStorage.getItem('darkMode') === 'true') { 
      document.body.classList.add('dark-mode'); 
    }
    if (localStorage.getItem('compactMode') === 'true') { 
      document.body.classList.add('compact-mode'); 
    }
  </script>
  <div class="app">
    <header class="app__header">
      <a class="link-button" href="calc-[category].html">← Back to [CATEGORY]</a>
      <span>[Calculator Name]</span>
      <span></span>
    </header>
    <main class="app__content">
      <section class="card">
        <h2>[Calculator Title]</h2>
        <p>[Description]</p>
        
        <form id="calcForm" style="margin-top: 20px;">
          <!-- Input fields here -->
          <button type="submit" class="btn btn--primary" style="width: 100%; padding: 14px;">
            Calculate
          </button>
        </form>
        
        <div id="result" style="display: none; margin-top: 24px;">
          <!-- Results display here -->
        </div>
      </section>
    </main>
    
    <!-- Standard tabbar navigation -->
  </div>
  
  <script>
    // Calculation logic here
  </script>
</body>
</html>
```

---

## Category Page Updates Needed

Update these files to add navigation buttons:

- **calc-risk.html** - Add 3 calculator buttons
- **calc-stock.html** - Add 4 calculator buttons  
- **calc-asset.html** - Add 2 calculator buttons
- **calc-retire.html** - Add 2 calculator buttons
- **calc-crypto.html** - Add 2 calculator buttons

---

## Next Steps

1. Create all category pages (5 remaining)
2. Create all individual calculator files (18 remaining)
3. Test all calculations for accuracy
4. Ensure dark mode and compact mode work on all pages
5. Add input validation and error handling
6. Consider adding "Save Calculation" feature
7. Add "Share Results" functionality

**Total Files to Create:** 23 new HTML files
**Estimated Time:** 3-4 hours for complete implementation

---

## Questions/Clarifications Needed

Please confirm:
1. **Tax brackets** - Should I use 2024 US federal tax brackets or allow custom input?
2. **Crypto mining** - Which cryptocurrency should I base the mining calculator on (Bitcoin, Ethereum, etc.) or make it generic?
3. **MPT Optimizer** - This is complex - would a simplified version with 3-4 asset classes be sufficient?
4. **Data persistence** - Should calculators save recent calculations to localStorage?
5. **Export feature** - Do you want PDF/CSV export of calculator results?
