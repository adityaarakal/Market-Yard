# PowerShell script for reliable git commits
# Usage: .\scripts\commit.ps1 "commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Add all changes
git add .

# Commit with single-line message (PowerShell-safe)
git commit -m $Message

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

