# Kage v1.1 - Subtask Editing Fixes

**Date**: 2025-08-04
**Version Code**: 2  
**Version Name**: 1.1
**File**: kage-v1.1-subtask-fixes.apk
**Size**: 4.1M

## 🔧 Critical Bug Fixes

### Task 5B.2: Subtask Editing State Management Fix ✅ FIXED
- **Issue**: Adding new subtasks unchecked existing completed subtasks and broke checkbox interactivity
- **Root Cause**: Flawed name-matching logic in TaskCreationModal + completion state reset in taskStore  
- **Solution**: Index-based subtask preservation + explicit completion state checking
- **Files Modified**: TaskCreationModal.tsx, taskStore.ts

### Expected Results:
- ✅ Adding new subtasks preserves existing completed subtasks
- ✅ Subtask checkbox interactivity continues working after edits
- ✅ Mixed completed/incomplete states preserved during task editing
- ✅ Completion states persist correctly when task is updated

## 📲 Installation Notes
**Version Code 2** enables automatic updates over previous v1.0 installations.
For clean install: Uninstall previous version first.

## 🚀 Next Priority Issues
1. **CRITICAL**: Timeblock save consistency (sometimes requires app restart)
2. **HIGH**: Task modal auto-opening on app startup  
3. **HIGH**: Archive goals functionality missing
4. **HIGH**: Archive access in settings needed
5. **MEDIUM**: Mobile autocorrect not working in input fields

---
*Built with Java 21 | Android SDK 35 | Capacitor 7.4.2*
