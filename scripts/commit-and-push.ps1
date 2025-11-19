# Automated commit and push script
# This script commits and pushes in one go, avoiding the "interrupted" confusion
# Usage: .\scripts\commit-and-push.ps1 "commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

# Commit with single-line message
Write-Host "Committing..." -ForegroundColor Yellow
git commit -m $Message | Out-Null

# Check if commit was successful by checking exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Commit successful!" -ForegroundColor Green
    
    # Verify commit exists
    $logOutput = git log -1 --oneline
    Write-Host "Commit: $logOutput" -ForegroundColor Cyan
    
    # Push automatically
    Write-Host "Pushing to remote..." -ForegroundColor Yellow
    git push | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Push successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "All done! Commit and push completed successfully." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Push failed. Check your connection or permissions." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[ERROR] Commit failed. Check the error above." -ForegroundColor Red
    exit 1
}
