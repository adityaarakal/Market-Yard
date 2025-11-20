# Platform Compatibility Guide

> ⚠️ **IMPORTANT DISCLAIMER**: This document clearly explains which features are for **Windows** and which are for **Mac/Linux**.

## 🎯 Overview

This project is designed to work seamlessly on **both macOS and Windows**. All scripts automatically detect your operating system and apply the appropriate configuration.

**Key Principle**: Windows-specific code **ONLY runs on Windows**. Mac/Linux code **ONLY runs on Mac/Linux**.

---

## 🍎 macOS / Linux (Unix-like Systems)

### ✅ Default Behavior - NO CHANGES NEEDED
- **Works out of the box** - No special setup required
- Uses standard bash (already installed)
- Standard Unix paths work correctly
- All git hooks work normally
- **Zero impact from Windows compatibility code**

### What You Need
- Git (usually pre-installed or via Homebrew)
- Node.js and npm
- Standard bash shell

### Scripts That Apply
- ✅ All standard bash scripts work directly
- ✅ No path conversion needed
- ✅ No special wrappers required
- ✅ **Windows-specific scripts are ignored on Mac**

---

## 🪟 Windows

### ⚠️ Special Requirements (Windows Only)
- ✅ **Git for Windows** with **Git Bash** component installed
- ✅ Git Bash should be at: `C:\Program Files\Git\bin\bash.exe`
- ✅ PowerShell (usually pre-installed)

### What's Different on Windows
The following features are **Windows-specific** and **ONLY activate on Windows**:

#### 1. **Automatic Bash Detection** (`.husky/pre-commit`)
   - **Windows Only**: Automatically finds Git Bash on Windows
   - **Mac/Linux**: Uses standard bash (no detection needed)
   - Only searches Windows paths when on Windows
   - On Mac/Linux, uses standard bash directly

#### 2. **Path Conversion** (`scripts/version-utils.sh`)
   - **Windows Only**: Converts Unix-style paths (`/c/Users/...`) to Windows paths (`C:/Users/...`)
   - **Mac/Linux**: Paths work as-is, no conversion
   - Only runs on Windows
   - Mac/Linux paths work as-is

#### 3. **PowerShell Helper Scripts** (Windows Only - Can Be Ignored on Mac)
   - `scripts/get-bash-path.ps1` - Finds Git Bash (Windows only)
   - `scripts/verify-windows-setup.ps1` - Verifies Windows setup (Windows only)
   - `scripts/hook-wrapper.ps1` - Wraps bash scripts for Windows (Windows only)
   - `scripts/run-bash-script.ps1` - Runs bash from PowerShell (Windows only)

**Note**: These PowerShell scripts are **Windows-only** and can be safely ignored on Mac.

### Verification (Windows Only)
Run this to verify your Windows setup:
```powershell
npm run verify-windows-setup
```

**Mac users**: You don't need to run this - it's Windows-only.

---

## 🔍 How OS Detection Works

### Automatic Detection
All scripts automatically detect your OS using:
- `$OSTYPE` environment variable
- `$WINDIR` environment variable (Windows only)
- `uname -s` command
- Multiple fallback methods

### Detection Logic
```bash
# Windows detected if:
- $OSTYPE == "msys" or "cygwin" or "win32"
- $WINDIR is set
- $OS starts with "Windows"
- uname -s returns "MINGW*" or "MSYS*"

# macOS detected if:
- $OSTYPE == "darwin*"
- uname -s returns "Darwin"

# Linux detected if:
- $OSTYPE == "linux-gnu*"
- uname -s returns "Linux"
```

---

## 📁 Platform-Specific Files

### ⚠️ Windows-Only Files (Can Be Ignored on Mac)
These files are **only used on Windows** and can be safely ignored on Mac:

- `scripts/get-bash-path.ps1` ⚠️ **Windows only**
- `scripts/verify-windows-setup.ps1` ⚠️ **Windows only**
- `scripts/hook-wrapper.ps1` ⚠️ **Windows only**
- `scripts/run-bash-script.ps1` ⚠️ **Windows only**

**Mac users**: These files won't be executed on your system.

### ✅ Cross-Platform Files (Work on Both)
These files work on **both platforms** with automatic OS detection:

- `.husky/pre-commit` ✅ **Auto-detects OS** - Windows code only on Windows
- `scripts/version-utils.sh` ✅ **Auto-detects OS** - Windows code only on Windows
- `scripts/validate-version-bump.sh` ✅ **Works on both**
- `scripts/validate-enforcement-lock.sh` ✅ **Works on both**
- `scripts/detect-os.sh` ✅ **Works on both** - Used by other scripts

---

## 🚨 Important Notes for AI Agents

### For Cursor / GitHub Copilot / AI Assistants

**⚠️ CRITICAL**: When working on this project:

1. **On macOS**: 
   - ✅ All scripts work normally
   - ✅ No special handling needed
   - ✅ Standard bash paths work
   - ✅ **Windows-specific code is automatically skipped**

2. **On Windows**:
   - ✅ Scripts automatically detect Windows
   - ✅ Windows-specific code only runs on Windows
   - ✅ Mac-specific code is skipped on Windows

3. **Cross-Platform Commits**:
   - ✅ Same codebase works on both platforms
   - ✅ Git hooks adapt automatically
   - ✅ No manual OS switching needed

### What NOT to Do

❌ **Don't** hardcode Windows paths in shared scripts
❌ **Don't** assume bash location (use detection)
❌ **Don't** skip OS detection (always check OS first)
❌ **Don't** modify platform-specific files without understanding the OS

### What TO Do

✅ **Do** use OS detection functions
✅ **Do** test on both platforms if possible
✅ **Do** check `docs/PLATFORM_COMPATIBILITY.md` before making changes
✅ **Do** verify Windows setup with `npm run verify-windows-setup` (Windows only)
✅ **Do** wrap Windows-specific code in `if [ "$CURRENT_OS" = "windows" ]` checks

---

## 🧪 Testing on Both Platforms

### Testing Checklist

**macOS:**
- [ ] Git hooks run without errors
- [ ] Version validation works
- [ ] All scripts execute normally
- [ ] No Windows-specific errors
- [ ] **Windows-specific scripts are not executed**

**Windows:**
- [ ] Run `npm run verify-windows-setup` - all checks pass
- [ ] Git hooks run without hanging
- [ ] Version validation works
- [ ] Path conversion works correctly
- [ ] **Mac-specific code is not executed**

---

## 📚 Related Documentation

- `docs/QUICK_START.md` - Quick start guide for both platforms
- `docs/WINDOWS_SETUP.md` - Detailed Windows setup guide (Windows only)
- `docs/GIT_HOOKS_WORKFLOW.md` - Git hooks documentation

---

## 🆘 Troubleshooting

### Issue: Scripts fail on Mac after Windows changes

**Solution**: This shouldn't happen. All scripts use OS detection. If a script fails:
1. Check if it uses OS detection (should check `$OSTYPE` or `$WINDIR`)
2. Verify Windows-specific code is wrapped in `if [ "$CURRENT_OS" = "windows" ]`
3. Check that paths use OS-aware conversion

### Issue: Windows-specific errors on Mac

**Solution**: This shouldn't happen. Windows-specific code only runs on Windows. If you see Windows errors on Mac:
1. Check the script's OS detection logic
2. Verify it's checking OS before running Windows code
3. Report as a bug

### Issue: Mac-specific code running on Windows

**Solution**: This also shouldn't happen. Mac-specific code should be wrapped in OS checks. If it happens:
1. Check the script's OS detection
2. Ensure Mac code is wrapped in `if [ "$CURRENT_OS" = "macos" ]`

---

## ✅ Summary

- **macOS/Linux**: Works out of the box, no special setup, **zero impact from Windows code**
- **Windows**: Requires Git Bash, but automatically detected
- **All Scripts**: Automatically detect OS and adapt
- **AI Agents**: Can work on either platform without issues
- **Cross-Platform**: Same codebase, automatic adaptation
- **Windows Code**: Only runs on Windows
- **Mac Code**: Only runs on Mac

**The project is designed to "just work" on both platforms!** 🎉

---

## 📋 Quick Reference

| Feature | macOS/Linux | Windows |
|---------|-------------|---------|
| Bash Detection | Standard bash | Auto-finds Git Bash |
| Path Conversion | Not needed | Auto-converts paths |
| PowerShell Scripts | Ignored | Used |
| Setup Required | None | Git Bash |
| Verification | Not needed | `npm run verify-windows-setup` |

