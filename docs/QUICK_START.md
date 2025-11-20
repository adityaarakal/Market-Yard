# Quick Start Guide

## 🚀 Getting Started

This project works on **both macOS and Windows** automatically!

### 🍎 macOS / Linux Users

**You're all set!** No special setup needed:
- ✅ Git hooks work out of the box
- ✅ All scripts work normally
- ✅ Standard bash is used
- ✅ **No Windows-specific code runs on your system**
- ✅ **Zero impact from Windows compatibility features**

**Just clone and go:**
```bash
git clone <repo-url>
cd Market-Yard
npm install
npm start
```

**That's it!** Everything works normally on Mac.

### 🪟 Windows Users

**One-time setup required:**
1. Ensure **Git for Windows** is installed with **Git Bash**
2. Verify setup:
   ```powershell
   npm run verify-windows-setup
   ```
3. If all checks pass, you're ready!

**That's it!** The project automatically detects Windows and uses the right configuration.

---

## 📚 Documentation by Platform

### For macOS / Linux
- ✅ **No special docs needed** - everything just works
- See `docs/PLATFORM_COMPATIBILITY.md` for details

### For Windows
- 📖 `docs/WINDOWS_SETUP.md` - Complete Windows setup guide
- 📖 `docs/PLATFORM_COMPATIBILITY.md` - Platform differences

---

## 🔍 Quick Verification

### macOS / Linux
```bash
# Just try a commit - it should work!
git add .
git commit -m "test: Verify hooks work"
```

### Windows
```powershell
# Verify setup first (Windows only)
npm run verify-windows-setup

# Then try a commit
git add .
git commit -m "test: Verify hooks work"
```

---

## ⚠️ Important Notes

1. **OS Detection is Automatic**: You don't need to configure anything
2. **Windows Code Only on Windows**: Windows-specific scripts only run on Windows
3. **Mac Code Only on Mac**: Mac-specific code only runs on Mac
4. **Same Codebase**: Works on both platforms from the same repository
5. **No Cross-Platform Issues**: Each platform only runs its own code

---

## 🆘 Need Help?

- **macOS issues**: Check `docs/PLATFORM_COMPATIBILITY.md`
- **Windows issues**: Check `docs/WINDOWS_SETUP.md`
- **General issues**: Check `docs/GIT_HOOKS_WORKFLOW.md`

---

**Happy coding on any platform!** 🎉

