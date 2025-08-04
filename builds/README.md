# Kage App - Build Archive

This directory contains all official builds of the Kage productivity app.

## 📱 Latest Version: v1.2.0 (2025-08-04)

### Quick Install
```bash
# Download and install latest APK
adb install builds/v1.2.0/kage-v1.2.0-debug.apk
```

## 🗂️ Build Structure

Each version folder contains:
- `kage-vX.X.X-debug.apk` - Installable Android APK
- `build_notes.md` - Comprehensive build documentation

## 📋 Version History

### v1.2.0 - Critical Bug Fixes & Archive System
- ✅ **Fixed**: Timeblock save consistency with retry logic
- ✅ **Fixed**: Task modal auto-opening on app startup  
- ✅ **Added**: Complete archive goals functionality
- ✅ **Enhanced**: Data persistence reliability
- **Size**: 4.1 MB
- **Build Date**: 2025-08-04

### v1.1.0 - Dashboard & Task Improvements
- ✅ **Fixed**: Dashboard high priority task display
- ✅ **Fixed**: Goal task editing duplication bug
- ✅ **Fixed**: Task duplicates with proper urgent/today separation
- **Size**: ~4.0 MB
- **Build Date**: 2025-08-01

### v1.0.0 - Initial Release  
- ✅ **Core**: Habits, Tasks, Goals, Journal, Calendar
- ✅ **Platform**: Android APK with Capacitor
- ✅ **Features**: Data import/export, PWA capabilities
- **Size**: ~3.8 MB
- **Build Date**: 2025-07-31

## 🔧 Build Environment

- **Node.js**: v22.17.1 LTS
- **Java**: OpenJDK 21.0.8 LTS  
- **Android**: API 22-35
- **Capacitor**: v7.4.2

## 📋 Installation Guide

1. **Enable Unknown Sources**: Settings > Security > Install unknown apps
2. **Download APK**: From builds/vX.X.X/ folder
3. **Install**: Tap APK file or use `adb install`
4. **Update**: APK will preserve existing data when updating

## 🧪 Testing Checklist

- [ ] App launches successfully
- [ ] Existing data preserved (for updates)
- [ ] Core features functional (Habits, Tasks, Goals, Journal, Calendar)
- [ ] Data export/import working
- [ ] Archive functionality working (v1.2.0+)
- [ ] Time blocking saves consistently (v1.2.0+)

---

*For detailed technical information, see individual build_notes.md files*