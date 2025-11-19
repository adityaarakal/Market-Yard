# PowerShell script for multi-line git commits
# Usage: .\scripts\commit-multi.ps1 "Title" "Body line 1" "Body line 2"

param(
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Body
)

# Add all changes
git add .

# Build commit message
$message = $Title
if ($Body.Count -gt 0) {
    $message += "`n`n" + ($Body -join "`n")
}

# Use -m multiple times for multi-line (PowerShell-safe)
$commitArgs = @("-m", $Title)
foreach ($line in $Body) {
    $commitArgs += "-m"
    $commitArgs += $line
}

git commit $commitArgs

# Check if commit was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Commit successful" -ForegroundColor Green
    Write-Host "Pushing to remote..." -ForegroundColor Yellow
    git push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Push successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Push failed" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Commit failed" -ForegroundColor Red
}

