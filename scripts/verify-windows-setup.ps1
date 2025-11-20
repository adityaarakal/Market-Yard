# Windows Setup Verification Script
# ⚠️ WINDOWS ONLY - This script is not used on Mac/Linux
# Verifies that Git Bash is available and hooks can run properly

Write-Host "Verifying Windows setup for git hooks..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Check Git installation
Write-Host "Checking Git installation..." -ForegroundColor Yellow
$gitPath = (Get-Command git -ErrorAction SilentlyContinue).Source
if ($gitPath) {
    Write-Host "  Git found: $gitPath" -ForegroundColor Green
    $gitVersion = git --version
    Write-Host "  Git version: $gitVersion" -ForegroundColor Green
} else {
    $errors += "Git is not installed or not in PATH"
    Write-Host "  Git not found" -ForegroundColor Red
}

# Check Git Bash
Write-Host ""
Write-Host "Checking Git Bash..." -ForegroundColor Yellow
$bashPath = & "$PSScriptRoot\get-bash-path.ps1"
if ($bashPath -and (Test-Path $bashPath)) {
    Write-Host "  Git Bash found: $bashPath" -ForegroundColor Green
} else {
    $errors += "Git Bash not found. Git hooks may hang or fail."
    Write-Host "  Git Bash not found" -ForegroundColor Red
    Write-Host "     Expected locations:" -ForegroundColor Yellow
    Write-Host "       - C:\Program Files\Git\bin\bash.exe" -ForegroundColor Gray
    Write-Host "       - C:\Program Files (x86)\Git\bin\bash.exe" -ForegroundColor Gray
}

# Check Node.js
Write-Host ""
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if ($nodePath) {
    Write-Host "  Node.js found: $nodePath" -ForegroundColor Green
    $nodeVersion = node --version
    Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    $warnings += "Node.js not found. Some scripts may not work."
    Write-Host "  Node.js not found" -ForegroundColor Yellow
}

# Check npm
Write-Host ""
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmPath = (Get-Command npm -ErrorAction SilentlyContinue).Source
if ($npmPath) {
    Write-Host "  npm found: $npmPath" -ForegroundColor Green
    $npmVersion = npm --version
    Write-Host "  npm version: $npmVersion" -ForegroundColor Green
} else {
    $warnings += "npm not found. Package scripts may not work."
    Write-Host "  npm not found" -ForegroundColor Yellow
}

# Check git hooks
Write-Host ""
Write-Host "Checking git hooks..." -ForegroundColor Yellow
$hookPath = ".husky\pre-commit"
if (Test-Path $hookPath) {
    Write-Host "  Pre-commit hook found" -ForegroundColor Green
} else {
    $warnings += "Pre-commit hook not found. Run 'npm run prepare' to install."
    Write-Host "  Pre-commit hook not found" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "All checks passed! Setup is correct." -ForegroundColor Green
    Write-Host ""
    Write-Host "Your git hooks should work properly on Windows." -ForegroundColor Green
    exit 0
} elseif ($errors.Count -eq 0) {
    Write-Host "Setup is mostly correct, but there are some warnings:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Git hooks should work, but some features may be limited." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "Setup issues found:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Additional warnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "Please fix these issues before using git hooks." -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix Git Bash issue:" -ForegroundColor Cyan
    Write-Host "  1. Ensure Git for Windows is installed" -ForegroundColor Gray
    Write-Host "  2. Download from: https://git-scm.com/download/win" -ForegroundColor Gray
    Write-Host "  3. During installation, ensure Git Bash is selected" -ForegroundColor Gray
    exit 1
}

