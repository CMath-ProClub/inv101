# Enable git hooks for this repo (run once)
# Usage: Open PowerShell in repo root and run: \n# .\scripts\enable_githooks.ps1

git config core.hooksPath .githooks
Write-Host "Git hooks enabled (core.hooksPath set to .githooks)"
