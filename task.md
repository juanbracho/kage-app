# Kage App - Development Tasks

## Project Overview

Kage is a comprehensive personal productivity PWA that integrates habits, tasks, goals, journal, and calendar functionality with a focus on clean UI and reliable cross-platform performance.

## Milestone 1: Core Stability & UI Consistency ✅

- [x] Task 1.1: Remove swipe gesture functionality from all modal components
- [x] Task 1.2: Fix HabitsPage layout consistency to match other pages
- [x] Task 1.3: Fix HabitsEmpty state width consistency
- [x] Task 1.4: Fix HabitKit import functionality for timezone handling
- [x] Task 1.5: Fix calendar duration calculation error (1.5h showing as 2h)
- [x] Task 1.6: Resolve React hooks ordering violations in GoalsPage, HabitsPage, TasksPage

## Milestone 2: User Experience Enhancements

- [ ] Task 2.1: Implement keyboard shortcuts for common actions
- [ ] Task 2.2: Add bulk operations for habits/tasks (mark multiple as complete)
- [ ] Task 2.3: Implement smart notifications for upcoming deadlines
- [ ] Task 2.4: Add data synchronization status indicators
- [ ] Task 2.5: Implement offline mode improvements

## Milestone 3: Advanced Features

- [ ] Task 3.1: Add habit streak analytics and insights
- [ ] Task 3.2: Implement goal progress visualization improvements
- [ ] Task 3.3: Add advanced filtering and search across all modules
- [ ] Task 3.4: Implement custom themes and personalization
- [ ] Task 3.5: Add export/import for additional formats

## Milestone 4: Data Persistence & User Account System

- [x] Task 4.1: Enhanced IndexedDB with installation tracking and device ID generation
- [x] Task 4.2: Version migration system for schema changes with automatic backup
- [x] Task 4.3: Auto-backup system for data protection across APK updates  
- [x] Task 4.4: User store enhancement with timezone auto-detection
- [ ] Task 4.5: Profile creation flow during onboarding integration
- [ ] Task 4.6: APK update data preservation testing (IN PROGRESS - blocked by build issues)

## Milestone 5: Critical User Feedback Fixes ✅

- [x] Task 5.1: Fix timeblock save consistency issues with retry logic and persistence verification
- [x] Task 5.2: Fix subtask editing bug preserving completion states during task updates
- [x] Task 5.3: Fix task modal auto-opening on app startup with proper initialization
- [x] Task 5.4: Implement complete archive goals functionality with Settings management
- [x] Task 5.5: Fix mobile autocorrect not working in app input fields

## Milestone 6: Performance & Polish

- [ ] Task 6.1: Optimize bundle size and loading performance
- [ ] Task 6.2: Implement progressive loading for large datasets
- [ ] Task 6.3: Add comprehensive error boundaries and fallbacks
- [ ] Task 6.4: Implement automated testing coverage
- [ ] Task 6.5: Add accessibility improvements
- [x] Task 6.6: Complete all User Notes implementations from user feedback
- [x] Task 6.7: Resolve persistent white screen issue in v1.3.x builds (CRITICAL)
- [x] Task 6.8: Implement native mobile export functionality with Capacitor
- [x] Task 6.9: Fix shopping list toggle ID collision bug
- [x] Task 6.10: Establish proper APK build process and organization standards

## Milestone 7: User Notes Implementation ✅ COMPLETED

- [x] Task 7.1: Fix status bar overlap issue on mobile devices
- [x] Task 7.2: Relocate "Add Subtask" and "Add Item" buttons to bottom of lists
- [x] Task 7.3: Correct habit date order to show historical context (last 4 days + current)
- [x] Task 7.4: Create grocery dashboard card for shopping list management
- [x] Task 7.5: Fix repetitive tasks logic to include start date in generation
- [x] Task 7.6: Implement native mobile export/backup functionality

## Milestone 8: Critical Bug Resolution ✅ COMPLETED

- [x] Task 8.1: Diagnose white screen issue across v1.3.0-v1.3.3 builds
- [x] Task 8.2: Analyze Android bug reports for asset loading failures
- [x] Task 8.3: Identify asset path mismatch as root cause (not WebView threading)
- [x] Task 8.4: Implement proper CAPACITOR=true build process
- [x] Task 8.5: Fix post-build script for relative path conversion
- [x] Task 8.6: Generate working v1.3.4-asset-fix APK
- [x] Task 8.7: Document complete debugging process for future reference

## Milestone 9: Goal Templates System Implementation ✅ COMPLETED

- [x] Task 9.1: Create JSON template schema and external storage system
- [x] Task 9.2: Develop comprehensive "Run a Marathon" pilot template with 16-week training program
- [x] Task 9.3: Implement template loading service with validation and error handling
- [x] Task 9.4: Fix createGoalFromTemplate function to actually create linked goals, tasks, and habits
- [x] Task 9.5: Update type definitions and interfaces for enhanced template system
- [x] Task 9.6: Integrate async template loading with UI states and error handling
- [x] Task 9.7: Implement real-world validation framework for template quality assurance
- [x] Task 9.8: Test end-to-end template creation flow with proper linking validation

## Milestone 10: White Screen Resolution & Template System Stability ✅ COMPLETED

- [x] Task 10.1: Identify and fix white screen regression in Goal Templates System (multiple root causes)
- [x] Task 10.2: Convert dynamic JSON imports to static TypeScript imports for mobile compatibility
- [x] Task 10.3: Resolve circular dependencies and runtime errors in store architecture
- [x] Task 10.4: Fix undefined variable errors causing immediate app crashes (sampleTemplates issue)
- [x] Task 10.5: Implement comprehensive error handling throughout template system
- [x] Task 10.6: Enhance onboarding template creation flow integration
- [x] Task 10.7: Build and deploy production-ready APK with all stability fixes
- [ ] Task 10.8: Debug remaining onboarding template creation issue (IN PROGRESS)

## Milestone 11: User Experience Enhancement (NEW USER FEEDBACK) 🔄

#### **Goal Milestones System**
- [ ] Task 11.1: Add milestone interface to Goal type with description and completion status
- [ ] Task 11.2: Create milestone CRUD operations in goalStore.ts
- [ ] Task 11.3: Build milestone management UI in GoalDetail component
- [ ] Task 11.4: Implement milestone display with checkboxes and progress tracking

#### **Progress Calculation Enhancement**
- [ ] Task 11.5: Design user-selectable progress tracking system architecture
- [ ] Task 11.6: Implement Tasks Mode progress calculation (current system - task completion %)
- [ ] Task 11.7: Implement Habits Mode progress calculation (habit completion rate over time)
- [ ] Task 11.8: Implement Milestones Mode progress calculation (milestone completion %)
- [ ] Task 11.9: Implement Mixed Mode progress calculation (weighted combination)
- [ ] Task 11.10: Create progress method settings UI in GoalDetail or Settings
- [ ] Task 11.11: Update goal progress display to show selected calculation method
- [ ] Task 11.12: Migrate existing goals to use default Tasks Mode calculation

#### **Journal Passcode Protection**
- [ ] Task 11.13: Design passcode security architecture with encryption
- [ ] Task 11.14: Create 4-digit numeric passcode setup UI in Settings
- [ ] Task 11.15: Implement secure passcode storage with encryption utilities
- [ ] Task 11.16: Build passcode entry modal for journal access control
- [ ] Task 11.17: Implement auto-lock system (inactivity/background detection)
- [ ] Task 11.18: Add enable/disable passcode toggle and change passcode functionality

#### **Enhanced Recurring Tasks Display**
- [ ] Task 11.19: Modify recurring task generation to create limited future instances
- [ ] Task 11.20: Implement "next 3 upcoming iterations" display on Tasks page
- [ ] Task 11.21: Update calendar view to show only next occurrence per recurring task
- [ ] Task 11.22: Create "upcoming tasks" filter mode vs "all instances"
- [ ] Task 11.23: Enhance morning task display to prioritize upcoming tasks
- [ ] Task 11.24: Update task scheduling logic for better UX with recurring tasks

## Features Checklist

- [x] Feature 1: Habits tracking with calendar view
- [x] Feature 2: Task management with priorities and due dates
- [x] Feature 3: Goals with progress tracking
- [x] Feature 4: Journal with date-based entries
- [x] Feature 5: Calendar with time blocking
- [x] Feature 6: Data export/import functionality
- [x] Feature 7: PWA capabilities with offline support
- [x] Feature 8: Dark/light theme support
- [x] Feature 9: Mobile-responsive design
- [x] Feature 10: Status bar mobile compatibility (CSS safe areas)
- [x] Feature 11: Native mobile file export (Capacitor filesystem)
- [x] Feature 12: Grocery shopping dashboard integration
- [x] Feature 13: Historical habit tracking context (last 4 days)
- [x] Feature 14: Proper recurring task generation logic
- [x] Feature 15: Mobile-optimized button positioning
- [x] Feature 16: JSON-based goal template system with external storage
- [x] Feature 17: Expert-validated goal templates with real-world success metrics
- [x] Feature 18: Comprehensive goal creation with linked tasks and habits ecosystems
- [x] Feature 19: Template loading service with validation and error handling
- [x] Feature 20: Marathon training template with 16-week structured program
- [ ] Feature 21: Goal milestones system with user-selectable progress calculation
- [ ] Feature 22: Journal passcode protection with 4-digit security
- [ ] Feature 23: Enhanced recurring tasks display (next 3 iterations + calendar optimization)
- [ ] Feature 24: Advanced analytics dashboard
- [ ] Feature 25: Data synchronization across devices
- [ ] Feature 26: Customizable widgets and layouts