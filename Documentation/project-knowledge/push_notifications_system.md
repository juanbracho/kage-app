# Project Kage - Push Notifications & Reminder System
**Complete specification for intelligent, context-aware notifications that drive engagement without overwhelming users**

---

## 🎯 **SYSTEM OVERVIEW**

### **Core Philosophy**
- **Smart, Not Spammy**: Contextual notifications that add value
- **User Control**: Granular control over what and when
- **Goal-Centric**: All notifications tie back to meaningful progress
- **Cross-Platform**: Consistent experience across iOS, Android, Web

### **Notification Categories**
1. **⏰ Reminders** - Proactive nudges for habits and tasks
2. **🎉 Celebrations** - Achievement and milestone recognition
3. **📊 Insights** - Progress updates and smart suggestions
4. **⚠️ Gentle Nudges** - Re-engagement for inactive users

---

## 📱 **NOTIFICATION TYPES & SPECIFICATIONS**

### **1. HABIT REMINDERS**

#### **Daily Habit Reminders**
```json
{
  "type": "habit_reminder",
  "title": "Time for your morning routine! 🌅",
  "body": "Don't forget to meditate and drink water",
  "data": {
    "habit_ids": [123, 456],
    "due_count": 2,
    "streak_info": {
      "meditation": {"current": 7, "goal": 30},
      "water": {"current": 12, "goal": 21}
    }
  },
  "actions": [
    {"id": "complete_all", "title": "Mark All Done"},
    {"id": "view_habits", "title": "View Habits"},
    {"id": "snooze_1h", "title": "Remind in 1 hour"}
  ],
  "scheduling": {
    "time": "user_defined_morning_time",
    "days": "daily_or_custom_pattern",
    "conditions": ["has_pending_habits", "not_already_completed"]
  }
}
```

#### **Streak Protection Alerts**
```json
{
  "type": "streak_protection", 
  "title": "Don't break your 15-day streak! 💪",
  "body": "You haven't logged your workout habit today",
  "data": {
    "habit_id": 789,
    "current_streak": 15,
    "hours_remaining": 3,
    "urgency": "high"
  },
  "actions": [
    {"id": "quick_complete", "title": "Mark Complete"},
    {"id": "skip_today", "title": "Skip Today"},
    {"id": "modify_habit", "title": "Adjust Habit"}
  ],
  "scheduling": {
    "trigger": "evening_if_not_completed",
    "time": "3_hours_before_day_end",
    "conditions": ["streak >= 7", "not_completed_today"]
  }
}
```

### **2. TASK REMINDERS**

#### **Smart Task Reminders**
```json
{
  "type": "task_reminder",
  "title": "Task due in 2 hours ⏰",
  "body": "\"Finish language learning lesson\" is due at 6:00 PM",
  "data": {
    "task_id": 456,
    "due_time": "2024-07-06T18:00:00Z",
    "priority": "high",
    "linked_goal": {
      "id": 123,
      "name": "Learn Spanish",
      "progress": 67.5
    }
  },
  "actions": [
    {"id": "mark_complete", "title": "Mark Complete"},
    {"id": "reschedule", "title": "Reschedule"},
    {"id": "start_timer", "title": "Start 25min Timer"}
  ],
  "scheduling": {
    "algorithm": "smart_reminder_calculation",
    "default_intervals": ["24h", "4h", "1h", "30m"],
    "priority_multiplier": "higher_priority_more_reminders"
  }
}
```

#### **Overdue Task Alerts**
```json
{
  "type": "task_overdue",
  "title": "Task overdue by 2 days 📅",
  "body": "\"Submit project proposal\" was due on July 4th",
  "data": {
    "task_id": 789,
    "overdue_days": 2,
    "original_due": "2024-07-04T17:00:00Z",
    "priority": "urgent"
  },
  "actions": [
    {"id": "mark_complete", "title": "Mark Complete"},
    {"id": "reschedule", "title": "Set New Date"},
    {"id": "break_down", "title": "Break Into Steps"}
  ],
  "scheduling": {
    "frequency": "daily_until_resolved",
    "escalation": "increase_urgency_over_time"
  }
}
```

### **3. ACHIEVEMENT CELEBRATIONS**

#### **Streak Milestones**
```json
{
  "type": "achievement_streak",
  "title": "🔥 7-day streak achieved!",
  "body": "You've meditated for 7 days straight. Keep it up!",
  "data": {
    "habit_id": 123,
    "milestone": 7,
    "next_milestone": 14,
    "achievement_level": "weekly"
  },
  "actions": [
    {"id": "share", "title": "Share Achievement"},
    {"id": "view_stats", "title": "View Progress"},
    {"id": "set_higher_goal", "title": "Increase Challenge"}
  ],
  "visual": {
    "style": "celebration",
    "animation": "confetti",
    "sound": "achievement_chime"
  }
}
```

#### **Goal Progress Milestones**
```json
{
  "type": "achievement_goal",
  "title": "🎯 50% of the way there!",
  "body": "You're halfway to learning Spanish. ¡Excelente progreso!",
  "data": {
    "goal_id": 456,
    "progress_percentage": 50,
    "tasks_completed": 12,
    "habits_maintained": 3,
    "time_invested": "45 hours"
  },
  "actions": [
    {"id": "view_progress", "title": "See Details"},
    {"id": "share", "title": "Share Progress"},
    {"id": "adjust_goal", "title": "Adjust Timeline"}
  ]
}
```

### **4. SMART INSIGHTS & SUGGESTIONS**

#### **Weekly Progress Summary**
```json
{
  "type": "weekly_insight",
  "title": "📊 Your week in review",
  "body": "Completed 18 habits, 7 tasks. Your best day was Tuesday!",
  "data": {
    "habits_completed": 18,
    "habits_total": 21,
    "tasks_completed": 7,
    "best_day": "Tuesday",
    "improvement_areas": ["evening_routine"],
    "suggestions": ["schedule_morning_habits_earlier"]
  },
  "actions": [
    {"id": "view_analytics", "title": "View Full Report"},
    {"id": "plan_next_week", "title": "Plan Next Week"},
    {"id": "adjust_habits", "title": "Optimize Routine"}
  ],
  "scheduling": {
    "time": "sunday_evening",
    "conditions": ["has_activity_this_week"]
  }
}
```

#### **Smart Suggestions**
```json
{
  "type": "smart_suggestion",
  "title": "💡 Suggestion: Link your habits",
  "body": "People who link meditation to morning routine have 40% better consistency",
  "data": {
    "suggestion_type": "habit_linking",
    "confidence": 0.85,
    "based_on": "user_pattern_analysis",
    "potential_impact": "improved_consistency"
  },
  "actions": [
    {"id": "apply_suggestion", "title": "Try This"},
    {"id": "learn_more", "title": "Learn More"},
    {"id": "dismiss", "title": "Not Interested"}
  ]
}
```

### **5. RE-ENGAGEMENT NOTIFICATIONS**

#### **Gentle Comeback Prompts**
```json
{
  "type": "re_engagement",
  "title": "We miss you! 🌱",
  "body": "Your fitness goal is waiting. Small steps lead to big changes.",
  "data": {
    "days_inactive": 3,
    "last_activity": "completed_workout_habit",
    "most_successful_goal": "fitness",
    "easy_wins": ["5_minute_walk", "drink_water"]
  },
  "actions": [
    {"id": "quick_habit", "title": "Just 5 minutes"},
    {"id": "view_progress", "title": "See My Progress"},
    {"id": "adjust_goals", "title": "Make It Easier"}
  ],
  "tone": "encouraging_not_guilty"
}
```

---

## 🧠 **INTELLIGENT SCHEDULING ALGORITHMS**

### **Smart Reminder Timing**

#### **Habit Reminder Algorithm**
```javascript
function calculateHabitReminderTime(habit, userSettings) {
  // Base time from user preference or habit setting
  let reminderTime = habit.reminder_time || userSettings.default_morning_time;
  
  // Adjust based on habit completion patterns
  const completionHistory = getHabitCompletionHistory(habit.id, 30); // Last 30 days
  const avgCompletionTime = calculateAverageCompletionTime(completionHistory);
  
  if (avgCompletionTime) {
    // Schedule reminder 1-2 hours before typical completion
    reminderTime = subtractHours(avgCompletionTime, 1.5);
  }
  
  // Factor in user's active hours
  const activeHours = getUserActiveHours(userSettings);
  reminderTime = constrainToActiveHours(reminderTime, activeHours);
  
  // Avoid notification clustering (space out multiple habit reminders)
  reminderTime = avoidClusteringWith(reminderTime, getOtherScheduledNotifications());
  
  return reminderTime;
}
```

#### **Task Reminder Calculation**
```javascript
function calculateTaskReminderTimes(task) {
  const reminders = [];
  
  if (!task.due_date) return reminders;
  
  const timeUntilDue = task.due_date - new Date();
  const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
  
  // Base reminder schedule by task type
  if (task.type === 'deadline') {
    // Aggressive reminding for deadlines
    if (hoursUntilDue > 168) reminders.push(168); // 1 week
    if (hoursUntilDue > 72) reminders.push(72);   // 3 days
    if (hoursUntilDue > 24) reminders.push(24);   // 1 day
    if (hoursUntilDue > 4) reminders.push(4);     // 4 hours
    if (hoursUntilDue > 1) reminders.push(1);     // 1 hour
  } else {
    // Standard reminders
    if (hoursUntilDue > 24) reminders.push(24);   // 1 day
    if (hoursUntilDue > 2) reminders.push(2);     // 2 hours
  }
  
  // Priority influence
  if (task.priority <= 2) { // High/Urgent
    reminders.push(0.5); // 30 minutes before
  }
  
  // Goal impact factor
  if (task.goal_id) {
    const goal = getGoal(task.goal_id);
    if (goal.target_date && isNearDeadline(goal.target_date)) {
      reminders.push(0.25); // 15 minutes for goal-critical tasks
    }
  }
  
  return reminders.map(hours => 
    new Date(task.due_date - hours * 60 * 60 * 1000)
  );
}
```

### **Do Not Disturb Intelligence**

#### **Smart Quiet Hours**
```javascript
function shouldSendNotification(notification, currentTime, userSettings) {
  // Respect explicit quiet hours
  if (isInQuietHours(currentTime, userSettings.quiet_hours)) {
    return scheduleForLater(notification, userSettings.wake_time);
  }
  
  // Detect user's sleep pattern from app usage
  const sleepPattern = detectSleepPattern(getUserActivityLogs());
  if (isLikelySleeping(currentTime, sleepPattern)) {
    return scheduleForLater(notification, sleepPattern.wake_time);
  }
  
  // Avoid notification fatigue (max 3 notifications per hour)
  const recentNotifications = getRecentNotifications(currentTime, 1); // Last hour
  if (recentNotifications.length >= 3) {
    return scheduleForLater(notification, addHours(currentTime, 1));
  }
  
  // Priority override for urgent items
  if (notification.data.urgency === 'high') {
    return true; // Send regardless (but still respect explicit quiet hours)
  }
  
  return true;
}
```

---

## 📊 **NOTIFICATION ANALYTICS & OPTIMIZATION**

### **Engagement Tracking**
```javascript
// Track notification effectiveness
const NotificationMetrics = {
  sent: {
    habit_reminder: 150,
    task_reminder: 89,
    achievement: 23,
    insight: 12
  },
  opened: {
    habit_reminder: 78,   // 52% open rate
    task_reminder: 67,    // 75% open rate
    achievement: 21,      // 91% open rate
    insight: 8            // 67% open rate
  },
  acted_upon: {
    habit_reminder: 45,   // 30% action rate
    task_reminder: 52,    // 58% action rate
    achievement: 18,      // 78% action rate
    insight: 3            // 25% action rate
  }
};

// Auto-optimize based on engagement
function optimizeNotificationFrequency(userId, notificationType) {
  const metrics = getNotificationMetrics(userId, notificationType, 30); // 30 days
  
  if (metrics.actionRate < 0.2) {
    // Low engagement - reduce frequency
    return adjustFrequency(notificationType, 'reduce');
  } else if (metrics.actionRate > 0.7) {
    // High engagement - potentially increase valuable notifications
    return adjustFrequency(notificationType, 'maintain');
  }
  
  return 'no_change';
}
```

---

## 🔧 **IMPLEMENTATION ARCHITECTURE**

### **Database Schema Extensions**
```sql
-- Notification Preferences
CREATE TABLE notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL, -- habits, tasks, achievements, insights
    enabled BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20) DEFAULT 'normal', -- minimal, normal, enhanced
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '07:00',
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Queue
CREATE TABLE notification_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSON,
    actions JSON,
    scheduled_for TIMESTAMP NOT NULL,
    sent_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    action_taken VARCHAR(50) NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, opened, acted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Analytics
CREATE TABLE notification_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    action_count INTEGER DEFAULT 0,
    dismissed_count INTEGER DEFAULT 0,
    UNIQUE(user_id, notification_type, date)
);
```

### **Service Architecture**
```javascript
// Notification Service Structure
class NotificationService {
  // Core scheduling
  async scheduleHabitReminders(userId, date)
  async scheduleTaskReminders(userId)
  async scheduleAchievementNotifications(userId)
  
  // Smart delivery
  async processNotificationQueue()
  async shouldSendNow(notification, userSettings)
  async optimizeDeliveryTime(notification)
  
  // Analytics
  async trackNotificationEngagement(notificationId, action)
  async generateEngagementReport(userId, period)
  async optimizeNotificationSettings(userId)
  
  // Content generation
  async generateSmartInsight(userId)
  async personalizeNotificationContent(notification, userContext)
}
```

---

## 📱 **USER EXPERIENCE SPECIFICATIONS**

### **Notification Settings UI**
Based on your existing Settings mockup, enhance the notifications section:

```
🔔 Notifications
├── 📱 Push Notifications [Toggle: ON]
│   └── Get reminders for habits and tasks
├── ⏰ Reminder Time [8:00 AM]
│   └── When to send daily reminders
├── 🎉 Achievement Notifications [Toggle: ON]
│   └── Celebrate streaks and milestones
├── 💡 Smart Insights [Toggle: ON]
│   └── Weekly progress and suggestions
├── 🌙 Quiet Hours [10:00 PM - 7:00 AM]
│   └── No notifications during sleep
└── 🎛️ Advanced Settings
    ├── Notification Frequency [Normal ▼]
    ├── Task Reminder Timing [Smart ▼]
    └── Streak Protection [ON]
```

### **In-App Notification Actions**
```javascript
// When user taps notification action
const NotificationActions = {
  'complete_habit': (habitId) => {
    markHabitComplete(habitId, new Date());
    showSuccessAnimation();
    updateStreakCounter();
  },
  
  'snooze_1h': (notificationId) => {
    rescheduleNotification(notificationId, addHours(new Date(), 1));
    showSnoozeConfirmation();
  },
  
  'start_timer': (taskId) => {
    openApp();
    navigateToTimer(taskId);
    startPomodoroTimer(25);
  },
  
  'view_progress': (entityId, entityType) => {
    openApp();
    navigateToProgressView(entityId, entityType);
  }
};
```

---

## 🎯 **SUCCESS METRICS & KPIs**

### **Engagement Metrics**
- **Notification Open Rate**: Target >60%
- **Action Completion Rate**: Target >40%
- **User Retention Impact**: +25% 7-day retention
- **Habit Consistency**: +30% completion rate

### **User Satisfaction**
- **Perceived Value**: Users find notifications helpful, not annoying
- **Customization Usage**: >70% of users adjust default settings
- **Opt-out Rate**: <10% disable notifications entirely

### **Business Impact**
- **Daily Active Users**: +15% increase
- **Session Frequency**: +20% return visits
- **Goal Completion**: +35% users complete goals
- **Premium Conversion**: Smart insights drive AI upgrade

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1)**
- Basic reminder system for habits and tasks
- User notification preferences
- Simple scheduling algorithm

### **Phase 2: Intelligence (Week 2-3)**
- Smart timing based on user patterns
- Do not disturb logic
- Engagement tracking and analytics

### **Phase 3: Personalization (Week 4)**
- AI-powered content personalization
- Achievement celebrations
- Smart insights and suggestions

### **Phase 4: Optimization (Week 5+)**
- Machine learning for optimal timing
- A/B testing notification content
- Advanced user behavior analysis

---

This notification system will be the engine that keeps users engaged with Kage while respecting their time and preferences. The key is delivering value through every notification, not just volume.