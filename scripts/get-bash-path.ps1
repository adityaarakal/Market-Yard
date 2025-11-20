# PowerShell script to get the path to Git Bash on Windows
# ⚠️ WINDOWS ONLY - This script is not used on Mac/Linux
# Returns the full path to bash.exe or empty string if not found

$gitBashPaths = @(
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "$env:ProgramFiles\Git\bin\bash.exe",
    "$env:ProgramFiles(x86)\Git\bin\bash.exe"
)

foreach ($path in $gitBashPaths) {
    if (Test-Path $path) {
        Write-Output $path
        exit 0
    }
}

# Try to find Git installation and derive bash path
$gitPath = (Get-Command git -ErrorAction SilentlyContinue).Source
if ($gitPath) {
    $gitDir = Split-Path (Split-Path $gitPath)
    $bashPath = Join-Path $gitDir "bin\bash.exe"
    if (Test-Path $bashPath) {
        Write-Output $bashPath
        exit 0
    }
}

# Not found
Write-Output ""
exit 1

