# PowerShell script to add gamification to all calculator HTML files

$calculators = @(
    "calc-core-annualized.html",
    "calc-core-roi.html",
    "calc-core-riskreward.html",
    "calc-core-volatility.html",
    "calc-asset-allocation.html",
    "calc-asset-mpt.html",
    "calc-risk-kelly.html",
    "calc-risk-position.html",
    "calc-risk-var.html",
    "calc-stock-pe.html",
    "calc-stock-intrinsic.html",
    "calc-stock-divyield.html",
    "calc-stock-divgrowth.html",
    "calc-tax-netprofit.html",
    "calc-tax-capitalgains.html",
    "calc-retire-savings.html",
    "calc-retire-401k.html",
    "calc-crypto-staking.html",
    "calc-crypto-mining.html"
)

$calcTypes = @{
    "calc-core-annualized.html" = "annualized-return"
    "calc-core-roi.html" = "roi"
    "calc-core-riskreward.html" = "risk-reward"
    "calc-core-volatility.html" = "volatility"
    "calc-asset-allocation.html" = "asset-allocation"
    "calc-asset-mpt.html" = "mpt-portfolio"
    "calc-risk-kelly.html" = "kelly-criterion"
    "calc-risk-position.html" = "position-sizing"
    "calc-risk-var.html" = "value-at-risk"
    "calc-stock-pe.html" = "pe-ratio"
    "calc-stock-intrinsic.html" = "intrinsic-value"
    "calc-stock-divyield.html" = "dividend-yield"
    "calc-stock-divgrowth.html" = "dividend-growth"
    "calc-tax-netprofit.html" = "net-profit"
    "calc-tax-capitalgains.html" = "capital-gains"
    "calc-retire-savings.html" = "retirement-savings"
    "calc-retire-401k.html" = "401k"
    "calc-crypto-staking.html" = "crypto-staking"
    "calc-crypto-mining.html" = "crypto-mining"
}

foreach ($calc in $calculators) {
    $filePath = "c:\Users\carte\inv101\prototype\$calc"
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Add scripts after device-detection.js if not already present
        if ($content -notmatch "calculator-xp-tracker\.js") {
            $content = $content -replace '(<script src="device-detection\.js"></script>)', "`$1`r`n  <script src=`"gamification-widget.js`"></script>`r`n  <script src=`"calculator-xp-tracker.js`"></script>"
            
            # Add XP trigger before closing script tag at the end
            $calcType = $calcTypes[$calc]
            $xpCode = @"
      
      // Award XP for calculation
      if (window.calculatorXP) {
        window.calculatorXP.trigger('$calcType');
      }
"@
            
            # Find the last });  before </script> and add XP code
            $content = $content -replace '(\r?\n\s*}\);\s*</script>\s*</body>)', "$xpCode`r`n    });`r`n  </script>`r`n</body>"
            
            Set-Content $filePath $content -NoNewline
            Write-Host "Updated: $calc" -ForegroundColor Green
        } else {
            Write-Host "Already updated: $calc" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Not found: $calc" -ForegroundColor Red
    }
}

Write-Host "`nAll calculators updated!" -ForegroundColor Cyan
