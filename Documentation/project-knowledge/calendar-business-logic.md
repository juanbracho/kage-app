# Project Kage - Calendar Integration: Complete Business Logic
**Purpose**: Comprehensive specification for calendar functionality with all views, interactions, and scheduling logic

---

## 🎯 **CALENDAR CORE FUNCTIONALITY**

### **✅ PRIMARY FEATURES**

#### **1. View Management**
- **Day View**: Single day with hourly slots (6 AM - 11 PM)
- **Week View**: 7-day horizontal scroll with time slots  
- **Month View**: Traditional calendar grid with event dots
- **Default**: Week View (most practical for productivity)

#### **2. Event Types**
- **Scheduled Tasks**: Tasks with specific due dates/times
- **Habit Reminders**: Habits scheduled for specific times  
- **Time Blocks**: Focus time periods (like "Deep Work")
- **External Events**: Imported from device calendar (read-only)

#### **3. Core Interactions**
- **View Switching**: Seamless transitions between Day/Week/Month
- **Drag & Drop**: Reschedule events by dragging (Week/Day views only)
- **Quick Add**: Tap empty time slot to create event
- **Event Details**: Tap existing event for details/actions

---

## 📅 **CALENDAR VIEW SPECIFICATIONS**

### **Day View Logic**
```
Time Range: 6:00 AM - 11:00 PM (17 hours)
Time Slots: 30-minute increments (34 slots total)
Header: Day name + Date (Monday, Dec 25)
Navigation: < Previous Day | Today | Next Day >
Events: Full width blocks showing time + title
```

**Visual Layout**:
- **Time Column**: 60px wide, shows hour markers
- **Event Column**: Remaining width, shows scheduled items
- **All-Day Section**: Top area for all-day events
- **Current Time**: Red line indicator (when viewing today)

### **Week View Logic**
```
Time Range: 6:00 AM - 11:00 PM (17 hours)  
Days: 7 columns (Monday - Sunday)
Time Slots: 30-minute increments
Header: Week of [Start Date] - [End Date]
Navigation: < Previous Week | This Week | Next Week >
Events: Proportional width blocks in day columns
```

**Visual Layout**:
- **Day Headers**: Day name + date number
- **Time Grid**: Horizontal lines every 30 minutes
- **Event Blocks**: Color-coded by type, show title
- **Multi-day Events**: Span across multiple day columns

### **Month View Logic**
```
Layout: 6 rows x 7 columns (42 cells total)
Previous/Next Month Days: Shown in muted color
Header: Month Year (December 2024)
Navigation: < Previous Month | This Month | Next Month >
Events: Small dots or mini-bars (max 3 visible per day)
```

**Visual Layout**:
- **Date Numbers**: Top-left of each cell
- **Event Indicators**: Colored dots below date
- **Today Highlight**: Orange border around current date
- **Overflow Indicator**: "+2 more" when >3 events

---

## ⚡ **EVENT CREATION FLOWS**

### **Quick Add Flow (Tap Empty Slot)**
```
User taps empty time slot → Quick add popup appears

Popup Options:
○ Link Existing Task     [Dropdown of pending tasks]
○ Link Existing Habit    [Dropdown of today's habits]  
○ Create Time Block      [Focus time with custom title]
○ Add Custom Event       [Free-form event]

Common Fields (All Types):
- Duration: [30 min] [1 hour] [2 hours] [Custom]
- Title: Auto-filled or custom
- Color: Inherits from linked item or custom

Action Buttons:
[Cancel] [Create Event]
```

### **Task Scheduling Flow**
```
When "Link Existing Task" selected:

Task Dropdown Shows:
- Pending tasks (not completed)
- Tasks due today/tomorrow/this week
- Recently created tasks
- "Create New Task" option

Selected Task Auto-fills:
- Title: Task name
- Duration: Estimated time or 1 hour default
- Color: Task priority color or goal color
- Type: "Scheduled Task"

Additional Options:
- Set as deadline: [Toggle] (marks task due at this time)
- Send reminder: [Toggle] (notification before start)
```

### **Habit Scheduling Flow**
```
When "Link Existing Habit" selected:

Habit Dropdown Shows:
- Today's pending habits (not completed)
- Recurring habits due today
- Habits linked to selected goal
- "Browse All Habits" option

Selected Habit Auto-fills:
- Title: Habit name
- Duration: Target time or 30 min default
- Color: Habit color
- Type: "Habit Reminder"

Additional Options:
- Recurring: [Toggle] (repeat at this time daily/weekly)
- Mark complete when time ends: [Toggle]
```

### **Time Block Creation Flow**
```
When "Create Time Block" selected:

Required Fields:
- Activity: [Deep Work] [Learning] [Planning] [Custom]
- Duration: [30 min] [1 hour] [2 hours] [Custom]

Optional Fields:
- Description: What you'll focus on
- Block distractions: [Toggle] (future feature)
- Link to goal: [Dropdown] (optional connection)

Pre-defined Time Block Types:
🧠 Deep Work - 2 hours - Blue
📚 Learning - 1 hour - Purple  
📋 Planning - 30 min - Orange
💪 Exercise - 1 hour - Green
🧘 Focus Time - 30 min - Teal
```

---

## 🔄 **DRAG & DROP LOGIC**

### **Drag Mechanics (Week/Day Views Only)**
```
Drag Start:
- Event becomes semi-transparent
- Drop zones highlight (valid time slots)
- Invalid zones show red overlay
- Scroll views when dragging near edges

Valid Drop Zones:
- Any empty time slot
- Time slots that would only partially overlap
- Same event (no-op, just visual feedback)

Invalid Drop Zones:
- Fully occupied time slots  
- Past time slots (if event is today/future)
- Outside calendar view area

Drop Behavior:
- Valid drop: Event moves with smooth animation
- Invalid drop: Event snaps back to original position
- Partial overlap: Show conflict resolution dialog
```

### **Conflict Resolution Dialog**
```
When dropping event on partially occupied slot:

Dialog: "Time Conflict Detected"
Message: "This overlaps with [Event Name] from [Time]"

Options:
○ Move anyway (creates overlap)
○ Adjust start time (fits before existing event)  
○ Adjust end time (fits after existing event)
○ Cancel (return to original position)

[Cancel] [Apply Selected Option]
```

### **Auto-Scheduling Intelligence**
```
When scheduling linked tasks/habits:

Smart Time Suggestions:
1. User's most productive hours (from habit data)
2. Available slots based on existing events
3. Optimal spacing between similar activities
4. Goal deadline proximity (urgent tasks prioritized)

Suggestion Algorithm:
- Morning: High-energy tasks (exercise, important work)
- Afternoon: Routine tasks (admin, habits)  
- Evening: Low-energy tasks (reading, planning)
```

---

## 📱 **MOBILE INTERACTIONS**

### **Touch Gestures**
```
Single Tap: Select event → Show quick actions popup
Double Tap: Edit event → Open edit modal
Long Press: Drag mode → Start drag and drop
Pinch: Time scale → Zoom in/out time resolution (future)
Swipe Left/Right: Navigate → Previous/next period
Pull to Refresh: Sync → Refresh calendar data
```

### **Quick Actions Popup**
```
Appears on single tap of event:

Actions (Context Dependent):
✅ Mark Complete (Tasks/Habits only)
✏️ Edit Event
📋 View Details  
🔔 Snooze Reminder (15min/30min/1hour)
🗑️ Delete Event
➡️ Reschedule (opens time picker)

Popup Position:
- Above event if space available
- Below event if near top of screen
- Side position if event is very narrow
```

---

## 🔗 **INTEGRATION LOGIC**

### **Task Integration**
```
Task Completion from Calendar:
1. User marks task complete in calendar
2. Task status updates across all views
3. Goal progress recalculates if task linked
4. Dashboard metrics update
5. Journal auto-prompt may trigger
6. Habit suggestions may appear

Task Updates Affecting Calendar:
- Task completed elsewhere → Remove from calendar
- Task due date changed → Update calendar position  
- Task priority changed → Update color coding
- Task deleted → Remove calendar event
```

### **Habit Integration**  
```
Habit Completion from Calendar:
1. User marks habit complete in calendar
2. Habit streak updates
3. Grid view updates with completion
4. Goal progress updates if habit linked
5. Achievement celebration if milestone
6. Calendar shows completed state (checkmark)

Habit Updates Affecting Calendar:
- Habit frequency changed → Update recurring events
- Habit target time changed → Update event duration
- Habit color changed → Update event color
- Habit archived → Remove future recurring events
```

### **Goal Integration**
```
Goal-Calendar Connections:
- Filter calendar by goal → Show only linked events
- Goal deadline approaching → Highlight related events
- Goal completed → Celebrate linked events completion
- Goal archived → Option to remove linked events

Calendar Goal Insights:
- Time allocation per goal (analytics view)
- Goal progress based on scheduled vs actual time
- Optimal scheduling suggestions for goal activities
```

---

## 📊 **DATA & STATE MANAGEMENT**

### **Event Data Structure**
```javascript
CalendarEvent {
  id: string
  title: string
  startTime: DateTime
  endTime: DateTime
  type: 'task' | 'habit' | 'timeblock' | 'external'
  linkedId?: string (task/habit ID if linked)
  color: string (hex color)
  isRecurring: boolean
  recurrenceRule?: string (cron-like pattern)
  isCompleted: boolean
  reminderMinutes?: number
  description?: string
  location?: string (future feature)
  attendees?: string[] (future feature)
}
```

### **Calendar State Management**
```javascript
CalendarState {
  currentView: 'day' | 'week' | 'month'
  selectedDate: DateTime
  viewRange: { start: DateTime, end: DateTime }
  events: CalendarEvent[]
  selectedEvent?: CalendarEvent
  isDragging: boolean
  dragTarget?: CalendarEvent
  filters: {
    showTasks: boolean
    showHabits: boolean  
    showTimeBlocks: boolean
    showExternal: boolean
    goalFilter?: string
  }
  syncStatus: 'synced' | 'syncing' | 'error'
}
```

### **Real-time Updates**
```javascript
Calendar Event Listeners:
- Task created/updated/deleted → Refresh calendar events
- Habit created/updated/deleted → Refresh calendar events  
- Goal archived → Update linked event colors
- User timezone changed → Recalculate all event times
- External calendar sync → Merge external events
- Notification scheduled → Update reminder queue
```

---

## ⚠️ **EDGE CASES & VALIDATION**

### **Time Validation**
- **Past Events**: Allow viewing but prevent editing past events
- **Timezone Changes**: Gracefully handle timezone shifts  
- **Daylight Saving**: Automatically adjust for DST transitions
- **Invalid Times**: Prevent end time before start time
- **Duration Limits**: Max 12 hours per event, min 15 minutes

### **Conflict Handling**
- **Overlapping Events**: Visual indication, user choice to allow
- **External Calendar Conflicts**: Show warning, don't auto-resolve
- **Recurring Event Changes**: Apply to single instance or all future
- **Deleted Linked Items**: Archive calendar event, don't delete

### **Performance Considerations**
- **Large Date Ranges**: Lazy load events outside visible range
- **Many Events**: Virtual scrolling for days with 20+ events
- **Recurring Events**: Generate instances on-demand, not pre-create
- **Sync Frequency**: Max once per minute, debounce rapid changes

---

## 🚀 **FUTURE ENHANCEMENTS**

### **Phase 2 Features**
- **External Calendar Sync**: Google Calendar, Apple Calendar integration
- **Team Calendars**: Shared calendars for collaborative goals
- **Calendar Templates**: Pre-built schedules for common routines
- **Time Tracking**: Automatic time tracking for completed events

### **AI-Powered Features (Premium)**
- **Smart Scheduling**: AI suggests optimal times for tasks/habits
- **Routine Analysis**: AI identifies and suggests routine improvements  
- **Energy Mapping**: Track energy levels and suggest activity timing
- **Productivity Insights**: AI analysis of time allocation effectiveness

---

## 🎯 **IMPLEMENTATION CHECKLIST**

### **MVP Features (Phase 1)**
✅ Day/Week/Month view switching  
✅ Quick add event creation  
✅ Basic drag & drop rescheduling  
✅ Task/Habit/TimeBlock integration  
✅ Event completion from calendar  
✅ Real-time sync with other features  

### **Enhanced Features (Phase 2)**  
⬜ Advanced drag & drop with conflict resolution  
⬜ Recurring event management  
⬜ External calendar sync  
⬜ Advanced filtering and search  
⬜ Performance optimizations  
⬜ Offline functionality  

### **Premium Features (Phase 3)**
⬜ AI scheduling suggestions  
⬜ Advanced analytics and insights  
⬜ Team collaboration features  
⬜ Custom calendar templates  
⬜ Advanced notification system  

---

## 💡 **KEY SUCCESS METRICS**

### **User Engagement**
- **Scheduling Adoption**: % of tasks/habits that get scheduled
- **Drag & Drop Usage**: Frequency of rescheduling via drag
- **View Preference**: Which calendar views users prefer
- **Completion Rate**: Tasks/habits completed via calendar vs other methods

### **Feature Effectiveness**  
- **Time Block Usage**: How often users create focus time
- **Integration Value**: Whether calendar increases task/habit completion
- **Sync Reliability**: External calendar sync success rate
- **Performance**: Calendar load times and responsiveness

**This calendar system will make Project Kage the most comprehensive productivity platform available!** 🔥