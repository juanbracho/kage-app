# Project Kage - Consolidated App Definition

**Goal**: Build a focused, clean productivity app that stands strongly on its own before adding AI superpowers, with potential for health app spinoff "Renkei".

## **THE CORE IDEA**
**Kage** is a comprehensive productivity app that combines habit tracking, goal setting, task management, and journaling. The app works completely on its own as a powerful productivity system, but becomes **exponentially more valuable** with the optional AI companion upgrade - making the AI feel absolutely essential once experienced.

## **FREEMIUM BUSINESS MODEL**
- **FREE TIER**: Complete productivity suite (goals, habits, tasks, journals, scheduling, community)
- **PREMIUM TIER**: AI companion "Kage" that supercharges every feature with intelligence
- **Strategy**: Make the free app so good that it hooks users, then make AI so transformative they can't imagine using the app without it

---

## **1. COMPREHENSIVE FEATURES LIST**

### **📋 Task Management**
- **Simple Task Display**: Task name and description
- **Sub-Tasks**: Add checklist items to any task for complex workflows
- **Task Types**: 
  - Standard tasks
  - "To-Buy" mode for recipes/grocery lists
  - "To-Time" mode for deadline-sensitive items
- **Categorization**: Work/Home/Projects with goal linking
- **Calendar Integration**: Drag tasks to schedule in calendar
- **Task Details Page**: Full task view with sub-tasks, notes, edit/delete options

### **🎯 Goal Setting System**
- **Template Library**: Pre-built goals for Health, Career, Self-Development, Spiritual
- **Goal Structure**: Target date, duration, environment setup tasks, daily habits
- **Notes & Tips**: Personalized motivational messages and guidance
- **Progress Tracking**: Visual bubbles that expand to show daily tasks/habits
- **Review Sessions**: Scheduled check-ins to assess progress and adjust plans
- **🤖 PREMIUM**: AI Goal Creation via conversation for tailored goals

### **🔄 Habit Tracking**
- **Core Focus**: Simple completion tracking like HabitKit
- **Multiple Views**: Grid view (primary), list view, calendar integration
- **Comprehensive Customization**: Detailed habit setup and scheduling options
- **Quick Completion**: Tap to mark complete with visual feedback
- **Streak Tracking**: Visual indicators for maintaining consistency
- **🤖 PREMIUM**: AI habit suggestions and optimization

### **📝 Journal Page**
- **Entry List View**: Chronological list of all journal entries
- **Entry Creation**: Simple text input for new entries
- **Linked Entries**: Show connection to goals/tasks/habits when applicable
- **Search/Filter**: Find entries by date or linked items
- **Entry Detail**: Full entry view with edit/delete options
- **🤖 PREMIUM**: AI writing prompts and reflection insights

### **📅 Calendar & Scheduling**
- **Multiple Views**: Daily, weekly, monthly calendar views
- **Drag & Drop**: Reschedule tasks and habits with visual feedback
- **Time Blocking**: Visual representation of scheduled work periods
- **Integration**: All tasks and habits appear automatically
- **🤖 PREMIUM**: AI calendar optimization and time blocking suggestions

### **📊 Analytics & Insights**
- **Progress Tracking**: Visual charts for goals, habits, and productivity trends
- **Completion Rates**: Percentage tracking across all productivity areas
- **Streak Analysis**: Longest streaks and consistency patterns
- **🤖 PREMIUM**: Advanced AI insights and personalized recommendations

---

## **2. CORE PAGES & NAVIGATION**

### **Primary Navigation (6 Tabs)**
1. **📊 Dashboard** - Overview cards showing active goals, tasks, and habits with today/week counts
2. **🎯 Goals** - Simple goal list (Reach It style) with task/habit counts and completion ratios
3. **✅ Tasks** - Task list with sub-task support and type categorization
4. **🔄 Habits** - HabitKit-style habit tracking with multiple view options
5. **📝 Journal** - Standalone journaling page with entry history
6. **📅 Calendar** - Daily/weekly/monthly views with drag-and-drop scheduling

### **Header Elements (All Pages)**
- **Left**: Kage logo and app name
- **Center**: Current tab name
- **Right**: Settings icon, Analytics icon

### **Bottom Navigation**
- **6 Tab Icons**: Dashboard, Goals, Tasks, Habits, Journal, Calendar
- **🤖 PREMIUM**: Central AI button positioned between tabs (bottom center)
- **Design**: AI button slightly elevated/distinct from tab bar

---

## **3. DETAILED PAGE WORKFLOWS**

### **📊 Dashboard Page**
- **Overview Cards**: 
  - Active Goals card (shows count, today's tasks due)
  - Tasks card (today's count, this week's count)
  - Habits card (today's completions, streak info)
- **Card Interactions**: Tap card for quick details, tap "View All" to go to specific page
- **Quick Actions**: Add new goal/task/habit buttons

### **🎯 Goals Page (Reach It Style)**
- **Simple List View**: 
  - Goal title and description
  - Task completion ratio (2/4 completed)
  - Number of linked habits
  - Target date
- **Goal Detail Page** (opens on tap):
  - Full goal description and motivation
  - All linked tasks with completion status
  - All linked habits with progress
  - Notes/journal section with "Add Note" button
  - Edit button (opens goal editing)
  - Delete button (prompts: Archive or Delete permanently)

### **✅ Tasks Page**
- **Simple List View**:
  - Task name and brief description
  - Task type indicator (standard, to-buy, deadline)
  - Due date if applicable
- **Task Detail Page** (opens on tap):
  - Full task description
  - Sub-tasks checklist
  - Linked goal (if any)
  - Notes section
  - Edit/Delete options with Archive prompt

### **🔄 Habits Page (HabitKit Style)**
- **Primary View**: Grid visualization for completion tracking
- **Alternative Views**: List view, calendar integration
- **Quick Actions**: Tap to mark complete/incomplete
- **Habit Detail Page** (opens on tap):
  - Habit description and customization
  - Scheduling options (daily, weekly, custom)
  - Streak information and history
  - Linked goal information
  - Notes/journal section
  - Comprehensive edit options
  - Delete with Archive prompt

### **📅 Calendar Page**
- **View Options**: Daily, Weekly, Monthly tabs
- **Interactive Elements**:
  - Drag tasks/habits to reschedule (daily/weekly view)
  - Tap items to open quick-edit modal
  - Modal shows basic info + "Edit" button for full detail page
- **Read-Only**: Calendar displays scheduled items from other pages
- **Time Blocking**: Visual representation of scheduled tasks and habits

---

## **4. USER WORKFLOW**
### **Daily Workflow**
1. **Morning**: Check Dashboard for overview of today's goals, tasks, and habits
2. **Throughout Day**: 
   - Complete tasks and habits with simple tap/check actions
   - Use calendar to reschedule items as needed
   - Add notes to goals/tasks/habits from their detail pages
3. **Evening**: Journal entry reflecting on the day, linked to completed goals/habits

### **Weekly Workflow**
1. **Planning**: Review goals, create new tasks, adjust habits
2. **Progress Review**: Check analytics page for trends and insights
3. **Optimization**: Archive completed goals, adjust schedules based on performance

---

## **5. AI INTEGRATION STRATEGY**
### **Free vs Premium Psychology**
1. **Free users get addicted** to the comprehensive productivity system
2. **Premium users experience AI magic** that makes manual input feel primitive
3. **AI becomes indispensable** - once you experience it, going back feels impossible
4. **Network effects**: AI users share better content, making community more valuable for everyone

### **Current Status (Already Built)**
- ✅ **Flask Application**: Ultra-modular backend with blueprints
- ✅ **Database Models**: Complete SQLAlchemy models with relationships
- ✅ **Core Templates**: Goal creation, dashboard, navigation system
- ✅ **CSS Framework**: Orange (#FF7101) theme with component system
- ✅ **Basic JavaScript**: Modular approach for interactivity

### **Immediate Priorities**
1. **Create Missing Templates**: Dashboard, updated navigation with header
2. **Fix Current Issues**: Task creation, JavaScript interactivity
3. **Implement Core Pages**: Goal detail, Task detail, Habit detail with edit/delete
4. **Calendar Functionality**: Drag-and-drop scheduling, multiple views
5. **Archive System**: Implement archive vs delete throughout app

---

## **6. TECHNICAL ARCHITECTURE**
### **Development Phases**
- **Phase 1**: Complete free tier core functionality (Dashboard, Goals, Tasks, Habits, Calendar)
- **Phase 2**: Polish user experience and add archive system
- **Phase 3**: AI integration infrastructure and basic premium features
- **Phase 4**: Advanced AI capabilities and analytics
- **Phase 5**: Future features (Temple app "Renkei", Community features)

---

## **7. SUCCESS METRICS**
### **Free Tier Engagement**
- **Daily Active Users**: Goal creation and habit completion rates
- **Retention**: 7-day, 30-day, and 90-day user retention
- **Feature Usage**: Which features drive the most engagement

### **Premium Conversion**
- **Trial to Paid**: Conversion rate from AI trial to subscription
- **Feature Stickiness**: Which AI features have highest usage
- **Churn Rate**: Monthly subscription retention rates

### **Product-Market Fit Indicators**
- **User Growth**: Organic growth rate and referral patterns
- **App Store Ratings**: Consistent 4.5+ star ratings
- **User Feedback**: Qualitative feedback about AI value proposition