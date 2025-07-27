# Project Kage - Journal System: Complete Business Logic
**Purpose**: Comprehensive specification for journal functionality including entry creation, linking system, auto-prompts, and reflection features

---

## 🎯 **JOURNAL CORE FUNCTIONALITY**

### **✅ PRIMARY FEATURES**

#### **1. Entry Creation**
- **Free-form text input** with rich formatting support
- **Mood tracking** with emoji selection (5 mood levels)
- **Cross-feature linking** to Goals/Tasks/Habits  
- **Tag system** for organization and search
- **Photo attachments** (future feature)

#### **2. Auto-Prompt System**
- **AI-generated prompts** based on user activity
- **Context-aware questions** related to completions/milestones
- **Reflection triggers** for significant events
- **Weekly/monthly review prompts**

#### **3. Organization & Discovery**
- **Chronological timeline** with infinite scroll
- **Smart filtering** by mood, links, tags, date
- **Search functionality** across all entry content
- **Entry templates** for common reflection types

---

## 📝 **JOURNAL ENTRY CREATION**

### **Entry Creation Modal/Interface**
```
Entry Input Area:
- Large text area (minimum 3 lines, auto-expanding)
- Placeholder: "What's on your mind? Reflect on your progress..."
- Character counter (visible after 100 characters)
- Auto-save every 30 seconds while typing

Mood Selection:
😢 Very Low [Red] 
😕 Low [Orange]
😐 Neutral [Gray]  
😊 Good [Light Green]
🤩 Great [Dark Green]
- Default: No mood selected (optional)
- Single selection, tap to change

Linking Section:
🎯 Link to Goal     [Dropdown: Active goals]
✅ Link to Task     [Dropdown: Recent/completed tasks]  
🔄 Link to Habit    [Dropdown: Today's habits]
- Multiple links allowed
- Shows linked item with removable chips
- "Link to..." button opens selection modal
```

### **Entry Data Structure**
```javascript
JournalEntry {
  id: string
  content: string (rich text/markdown)
  mood?: 'very-low' | 'low' | 'neutral' | 'good' | 'great'
  createdAt: DateTime
  updatedAt: DateTime
  wordCount: number
  linkedItems: {
    goals: string[]     // Goal IDs
    tasks: string[]     // Task IDs  
    habits: string[]    // Habit IDs
  }
  tags: string[]        // User-created tags
  isFromPrompt: boolean // Created from auto-prompt
  promptId?: string     // Reference to originating prompt
  photos?: string[]     // Photo URLs (future)
  isPrivate: boolean    // Default true
}
```

---

## 🔗 **LINKING SYSTEM LOGIC**

### **Goal Linking Flow**
```
User clicks "Link to Goal":

Goal Selection Modal:
- List of active goals with progress indicators
- Recent goals (completed in last 30 days)
- Search functionality
- "Create New Goal" option

Selected Goal Display:
[🎯 Get Fit & Healthy - 65%] [×]
- Shows goal icon, name, current progress
- X button to remove link
- Clicking goal chip opens goal detail (future)

Goal Link Benefits:
- Entry appears in goal's activity feed
- Goal detail shows recent journal reflections
- Analytics track reflection frequency per goal
```

### **Task Linking Flow**
```
User clicks "Link to Task":

Task Selection Modal:
- Recently completed tasks (last 7 days)
- Today's pending tasks
- Overdue tasks
- Search across all tasks
- "Create New Task" option

Task Categories:
Recently Completed ✅
- Show tasks completed in last 24 hours first
- Include completion time and linked goal
- Useful for reflecting on accomplishments

Today's Tasks 📋  
- Pending tasks due today
- Useful for planning or problem-solving entries
- Can link before starting work on task

Selected Task Display:
[✅ Complete project proposal] [×]
- Shows task status, name
- Completed tasks show checkmark
- Pending tasks show priority color
```

### **Habit Linking Flow**
```
User clicks "Link to Habit":

Habit Selection Modal:
- Today's habits (completed and pending)
- Yesterday's habits (for reflection)
- Current streak habits (celebration entries)
- Habit milestones (5, 10, 30, 100 day streaks)

Habit Categories:
Today's Progress 🔄
- Habits completed today (with completion time)
- Habits still pending today
- Useful for daily habit reflection

Streak Milestones 🔥
- Habits reaching streak milestones
- Special celebration prompts
- Long-term reflection opportunities

Selected Habit Display:
[🔄 Morning run - Day 23] [×]
- Shows habit icon, name, current streak
- Milestone habits show special indicator
- Clicking opens habit detail view
```

### **Link Management**
```
Multiple Links Support:
- Entry can link to multiple items of same type
- Entry can link across different types
- Visual chips show all linked items
- Remove individual links without affecting others

Link Validation:
- Can't link to archived/deleted items
- Warn if linking to very old items (>30 days)
- Suggest recent/relevant items first

Link Display Priority:
1. Goals (most important for reflection)
2. Completed tasks (accomplishment focus)  
3. Habits (daily progress)
4. Pending tasks (planning/problem-solving)
```

---

## 🤖 **AUTO-PROMPT SYSTEM**

### **Prompt Trigger Events**
```javascript
Prompt Triggers:
1. Habit Milestone Reached
   - 7, 14, 30, 60, 100 day streaks
   - First completion of new habit
   - Breaking a long streak (missed after 10+ days)

2. Goal Progress Milestones  
   - 25%, 50%, 75%, 100% completion
   - First task completed toward goal
   - Goal deadline approaching (1 week out)

3. Task Completion Patterns
   - Completing all daily tasks
   - Completing overdue task
   - Completing challenging/high-priority task

4. Time-Based Triggers
   - Weekly review (Sunday evening)
   - Monthly reflection (last day of month)
   - Quarterly goal review

5. Productivity Patterns
   - Highly productive day (many completions)
   - Low productivity day (few completions)  
   - Streak of productive days
```

### **Prompt Generation Logic**
```javascript
function generatePrompt(triggerType, context) {
  switch(triggerType) {
    case 'habit-milestone':
      return generateHabitPrompt(context.habit, context.streakDays);
    case 'goal-progress':
      return generateGoalPrompt(context.goal, context.progressPercent);
    case 'task-completion':
      return generateTaskPrompt(context.task, context.completionContext);
    case 'weekly-review':
      return generateWeeklyPrompt(context.weekStats);
    case 'productivity-pattern':
      return generateProductivityPrompt(context.pattern, context.data);
  }
}

// Example Habit Milestone Prompts
function generateHabitPrompt(habit, streakDays) {
  const templates = {
    7: [
      `🎉 You've completed "${habit.name}" for 7 days straight! How has this habit impacted your daily routine?`,
      `A week of "${habit.name}" - what changes have you noticed in yourself?`,
      `Seven days strong! What's been the most challenging part of maintaining "${habit.name}"?`
    ],
    30: [
      `🔥 30 days of "${habit.name}"! This is now officially a habit. How do you feel about this achievement?`,
      `One month milestone reached! How has "${habit.name}" changed your life?`,
      `30-day streak complete! What advice would you give someone starting "${habit.name}"?`
    ]
  };
  
  return randomChoice(templates[streakDays] || templates[7]);
}
```

### **Prompt Delivery System**
```
Prompt Appearance:
- Appears as notification (if enabled)
- Shows in journal interface as suggested prompt
- Available for 48 hours before expiring
- Can be dismissed or saved for later

Prompt Interface:
┌─────────────────────────────────────┐
│ 💡 Reflection Opportunity           │
│                                     │
│ You just completed your 15th day of │
│ "Morning meditation"! How has this  │
│ habit affected your stress levels?  │
│                                     │
│ [Dismiss] [Reflect on This] [Later] │
└─────────────────────────────────────┘

User Actions:
- Reflect on This: Opens journal with prompt pre-filled
- Later: Saves to "Pending Prompts" list  
- Dismiss: Removes prompt permanently

Prompt Pre-filling:
- Prompt text appears as placeholder
- Auto-links to triggering item (habit/goal/task)
- User can edit/delete prompt text
- Saves as normal entry when submitted
```

---

## 📚 **JOURNAL INTERFACE & ORGANIZATION**

### **Main Journal View**
```
Layout Structure:
┌─────────────────────────────────────┐
│ [+ New Entry] [🔍] [Filter] [Sort]  │
├─────────────────────────────────────┤
│ Today - December 25, 2024          │
│ ┌─────────────────────────────────┐ │
│ │ 😊 2:30 PM                      │ │
│ │ Had a great workout session...  │ │
│ │ 🎯 Get Fit & Healthy            │ │
│ │ 🔄 Morning run - Day 15         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Yesterday - December 24, 2024      │
│ ┌─────────────────────────────────┐ │
│ │ 😐 8:45 PM                      │ │
│ │ Struggling to stay motivated... │ │
│ │ #motivation #goals              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Entry Card Components:
- Mood emoji (top-left)
- Timestamp (top-right)  
- Entry preview (first 2 lines)
- Linked items (chips below text)
- Tags (hashtags at bottom)
- Word count (subtle, bottom-right)
```

### **Search & Filter System**
```
Search Functionality:
- Real-time search as user types
- Search across entry content, tags, linked items
- Fuzzy matching for typos
- Highlight matching terms in results

Filter Options:
Date Range:
○ Last 7 days
○ Last 30 days  
○ Last 90 days
○ Custom range

Mood Filter:
😢 Very Low   ☐
😕 Low        ☐  
😐 Neutral    ☐
😊 Good       ☐
🤩 Great      ☐

Link Filter:
○ Entries with goal links
○ Entries with task links
○ Entries with habit links
○ Entries with no links

Content Type:
○ Auto-prompted entries
○ Free-form entries
○ Entries with photos
○ Tagged entries

Sort Options:
○ Newest first (default)
○ Oldest first
○ Most linked items
○ Longest entries
○ By mood (high to low)
```

### **Entry Detail View**
```
Full Entry Display:
┌─────────────────────────────────────┐
│ ← Back to Journal                   │
├─────────────────────────────────────┤
│ 😊 Today, 2:30 PM                   │
│ 156 words • 2 min read              │
├─────────────────────────────────────┤
│                                     │
│ Had an amazing workout session      │
│ today! Finally managed to complete  │
│ the full routine without stopping.  │
│ The new habit of morning meditation │
│ is really helping with focus and    │
│ determination. Feeling grateful for │
│ this progress toward my fitness     │
│ goals.                              │
│                                     │
├─────────────────────────────────────┤
│ 🔗 Linked Items                     │
│ 🎯 Get Fit & Healthy (67% complete) │
│ 🔄 Morning meditation (Day 15)      │
│ ✅ Complete workout routine         │
├─────────────────────────────────────┤
│ 🏷️ Tags                            │
│ #motivation #fitness #progress      │
├─────────────────────────────────────┤
│ [Edit Entry] [Delete] [Share]       │
└─────────────────────────────────────┘

Entry Actions:
- Edit: Opens entry in edit mode
- Delete: Confirmation dialog, removes entry
- Share: Export as text or image (future)
- Add Tags: Quick tag editing
- Link More Items: Add additional links
```

---

## 📊 **ANALYTICS & INSIGHTS**

### **Journal Analytics Dashboard**
```
Analytics Sections:

Writing Patterns:
- Entries per week/month
- Average entry length
- Most active writing days
- Writing streak tracking

Mood Tracking:
- Mood distribution over time  
- Mood correlation with habit completion
- Mood trends (improving/declining)
- Average mood by day of week

Reflection Habits:
- Prompt response rate
- Most linked item types
- Reflection frequency per goal
- Tag usage patterns

Content Analysis (Premium):
- Keyword frequency analysis
- Sentiment analysis over time
- Topic modeling (major themes)
- Personal growth indicators
```

### **Mood Correlation Analysis**
```
Mood-Activity Correlations:
- Mood vs habit completion rate
- Mood vs productivity level  
- Mood vs goal progress
- Mood vs entry length

Insights Generated:
"Your mood tends to be 23% higher on days when you complete your morning run habit."

"You write 40% longer entries when your mood is 'Great' compared to 'Neutral'."

"Goal progress correlates positively with journal reflection frequency."
```

---

## 🔄 **INTEGRATION WITH OTHER FEATURES**

### **Dashboard Integration**
```
Journal Widget on Dashboard:
- Recent entry preview (last 24 hours)
- Current mood indicator  
- Writing streak counter
- Pending prompts indicator
- Quick add entry button

Widget States:
No Recent Entry:
┌─────────────────────────────────────┐
│ 📝 Journal                          │
│ No entries today                    │
│ [+ Reflect on your progress]        │
└─────────────────────────────────────┘

With Recent Entry:
┌─────────────────────────────────────┐
│ 📝 Journal                    😊    │
│ "Had a great workout session..."    │
│ 2 hours ago • 156 words             │
│ [+ Add another entry]               │
└─────────────────────────────────────┘
```

### **Goal Detail Integration**
```
Goal Page Journal Section:
- Recent reflections about this goal
- Mood trends related to goal progress
- Prompt responses specific to goal
- Quick reflection button

Example Display:
┌─────────────────────────────────────┐
│ 📖 Recent Reflections               │
│                                     │
│ Dec 25 😊 "Finally hit my target..." │
│ Dec 23 😐 "Struggling with..."       │
│ Dec 20 🤩 "Big breakthrough today!"  │
│                                     │
│ [+ Reflect on this goal]            │
└─────────────────────────────────────┘
```

### **Habit/Task Integration**
```
Item Detail Pages Show:
- Related journal entries
- Average mood when working on item
- Reflection frequency
- Growth insights from entries

Cross-Feature Prompts:
- Completing task → Journal prompt
- Habit milestone → Reflection suggestion  
- Goal progress → Weekly review prompt
- Low mood → Self-care habit suggestions
```

---

## ⚠️ **VALIDATION & EDGE CASES**

### **Entry Validation**
```
Content Validation:
- Minimum 10 characters for save
- Maximum 10,000 characters per entry
- Auto-save every 30 seconds while typing
- Prevent loss on accidental navigation

Link Validation:  
- Can't link to deleted/archived items
- Warn if linking to items >30 days old
- Maximum 10 links per entry
- Duplicate link prevention

Mood Validation:
- Optional field, can be empty
- Single selection only
- Can change mood after entry creation
- Mood required for mood analytics
```

### **Auto-Prompt Edge Cases**
```
Prompt Conflicts:
- Multiple prompts triggered simultaneously
- User dismisses many prompts → Reduce frequency
- User never responds to prompts → Stop auto-prompts
- Streak broken then resumed → Adjusted milestone prompts

Prompt Quality:
- Avoid repetitive prompt templates  
- Personalize based on user's past responses
- Context-aware prompts (time of day, recent activity)
- Fallback to generic prompts if personalization fails

Prompt Delivery:
- Respect user notification preferences
- Don't interrupt focused work time
- Batch multiple prompts if many trigger
- Expire old prompts to avoid overwhelm
```

### **Performance Considerations**
```
Large Entry Collections:
- Virtual scrolling for 1000+ entries
- Lazy load entry content on scroll
- Search indexing for fast text search
- Thumbnail generation for long entries

Auto-Save Behavior:
- Debounce auto-save to prevent spam
- Conflict resolution if multiple device edits
- Offline support with sync on reconnect
- Auto-save indicator in UI

Search Performance:
- Index entry content for fast search
- Cache recent search results
- Debounce search queries
- Progressive search result loading
```

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Core Journal (MVP)**
✅ Basic entry creation with text input  
✅ Mood selection system  
✅ Simple linking to Goals/Tasks/Habits  
✅ Chronological entry list  
✅ Basic search functionality  
✅ Auto-save and entry persistence  

### **Phase 2: Enhanced Features**  
⬜ Auto-prompt system with basic triggers  
⬜ Advanced filtering and sorting  
⬜ Tag system and management  
⬜ Entry analytics and mood tracking  
⬜ Integration with goal/habit details  
⬜ Rich text formatting support  

### **Phase 3: Premium Features**
⬜ AI-powered prompt personalization  
⬜ Advanced analytics and insights  
⬜ Photo attachments and media  
⬜ Export and sharing capabilities  
⬜ Template system for common reflections  
⬜ Collaborative journaling (future)  

---

## 💡 **SUCCESS METRICS**

### **Engagement Metrics**
- **Entry Frequency**: Entries per user per week
- **Response Rate**: % of auto-prompts that get responses
- **Link Usage**: % of entries that link to other features
- **Retention**: Users who journal consistently for 30+ days

### **Quality Indicators**
- **Entry Length**: Average words per entry (target: 50-200)
- **Mood Tracking**: % of entries with mood data
- **Search Usage**: How often users search past entries
- **Analytics Engagement**: % of users who view journal analytics

### **Cross-Feature Impact**
- **Reflection Boost**: Increased habit/task completion after journaling
- **Goal Progress**: Correlation between journaling and goal achievement
- **Mood Improvement**: Positive mood trends for regular journalers
- **Feature Stickiness**: Journal usage impact on overall app retention

**The journal system will be the emotional heart that connects all of Project Kage's features!** 📝✨