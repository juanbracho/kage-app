# Kage App - Build Process Requirements

## 🚨 CRITICAL BUILD PROCESS REQUIREMENTS

### APK Build Location
**MANDATORY**: All APK builds MUST be created in:
```
/mnt/c/Users/ELCACAZ/Desktop/Development/SoloDev/kage-app/builds/
```

### Required Build Steps (NO EXCEPTIONS)

#### 1. Create Build Folder
```bash
mkdir -p builds/v[VERSION]-[FEATURE-NAME]
```

#### 2. Generate APK
```bash
CAPACITOR=true npm run build
npx cap sync android
cd android && JAVA_HOME=/home/elcacas/java/jdk-21.0.8 ./gradlew assembleDebug
```

#### 3. Copy APK to Builds Folder
```bash
cp android/app/build/outputs/apk/debug/app-debug.apk builds/v[VERSION]-[FEATURE-NAME]/kage-v[VERSION]-[FEATURE-NAME]-debug.apk
```

#### 4. Create BUILD_NOTES.md
Must include:
- Release date and version
- Build status
- APK filename and size
- Feature description
- Technical implementation details
- Files modified
- Testing results
- User impact

### Build Folder Structure
```
builds/
├── v1.4.1-goal-milestones/
│   ├── BUILD_NOTES.md
│   └── kage-v1.4.1-goal-milestones-debug.apk
├── v1.4.2-milestone-realtime/
│   ├── BUILD_NOTES.md
│   └── kage-v1.4.2-milestone-realtime-debug.apk
└── v[NEXT-VERSION]-[FEATURE]/
    ├── BUILD_NOTES.md
    └── kage-v[NEXT-VERSION]-[FEATURE]-debug.apk
```

## ❌ Common Mistakes to Avoid

1. **Wrong Location**: Do NOT create builds in android/builds/ directory
2. **Missing BUILD_NOTES.md**: Every build MUST have documentation
3. **Incorrect APK Path**: APK must be copied to main builds/ folder
4. **Inconsistent Naming**: Follow v[VERSION]-[FEATURE] pattern

## ✅ Verification Checklist

Before considering build complete:
- [ ] Build folder exists in correct location
- [ ] APK file copied and properly named
- [ ] BUILD_NOTES.md created with comprehensive details
- [ ] User can see files in `/builds/v[VERSION]-[FEATURE]/`

## Project Memory Integration

This process is integrated with:
- Global CLAUDE.md build management rules
- SoloDev organization standards
- Task management and session logging requirements

---

**REMEMBER**: The user has emphasized this process multiple times. It is CRITICAL to follow these exact steps for every build without exception.