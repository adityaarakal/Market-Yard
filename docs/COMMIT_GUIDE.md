# Git Commit Guide - PowerShell Fix

## The Problem
PowerShell shows "Command was interrupted" when using multi-line commit messages because:
1. PowerShell's string parsing with newlines (`\n`) causes issues
2. The tool's output handler sees delayed output as "interrupted"
3. Commits actually succeed, but the output is misleading

## The Solution

### ✅ DO: Use Single-Line Commits
```powershell
git commit -m "feat: Add feature description"
```

### ✅ DO: Use Multiple -m Flags for Multi-Line
```powershell
git commit -m "Title" -m "Line 1" -m "Line 2"
```

### ❌ DON'T: Use Multi-Line Strings
```powershell
# This causes PowerShell parsing issues:
git commit -m "Title
Line 1
Line 2"
```

## For AI/Automated Commits

**Always use single-line or multiple -m flags:**
```powershell
# Single line (preferred)
git commit -m "feat: Description of changes"

# Multiple -m for structured messages
git commit -m "feat: Title" -m "- Change 1" -m "- Change 2"
```

## Verification

After any commit, verify it worked:
```powershell
git log -1 --oneline  # Should show your commit
git status            # Should show clean or ahead
```

## Scripts Available

- `scripts/commit.ps1` - Single-line commit helper
- `scripts/commit-multi.ps1` - Multi-line commit helper

