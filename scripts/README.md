# Git Commit Scripts

## Problem
PowerShell sometimes shows "Command was interrupted" when using multi-line commit messages, even though the commit succeeds. This is a PowerShell parsing issue.

## Solution

### Option 1: Use Single-Line Commits (Recommended)
```powershell
git commit -m "feat: Add feature description"
git push
```

### Option 2: Use Multiple -m Flags (For Multi-Line)
```powershell
git commit -m "Title" -m "Line 1" -m "Line 2"
git push
```

### Option 3: Use the Commit Scripts

**Single-line commit:**
```powershell
.\scripts\commit.ps1 "feat: Add feature description"
```

**Multi-line commit:**
```powershell
.\scripts\commit-multi.ps1 "feat: Add feature" "Line 1" "Line 2"
```

## Best Practice
For AI/automated commits, use single-line messages or multiple `-m` flags to avoid PowerShell parsing issues.

