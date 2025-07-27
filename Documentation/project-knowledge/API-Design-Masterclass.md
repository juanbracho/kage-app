# Project Kage - API Design Masterclass
*How to Design RESTful APIs for Interconnected Productivity Systems*

---

## **Class Overview: Why This Case is Special**

Welcome, students! Today we're designing APIs for Project Kage, a productivity app where **everything connects to everything else**. This isn't your typical CRUD API - we have goals that link to tasks and habits, calendars that display multiple entity types, and real-time progress calculations. 

This case teaches you how to handle:
- **Complex entity relationships** (one-to-many, many-to-many)
- **Cascade updates** (when one change affects multiple systems)
- **Aggregated data** (dashboard metrics, progress calculations)
- **Flexible linking** (journal entries can link to ANY entity)
- **Real-time updates** (UI reflects changes immediately)

---

## **Lesson 1: Resource Identification & Naming**

### **The Golden Rule: Resources, Not Actions**

In Project Kage, we have **primary resources** and **relationship resources**:

**Primary Resources** (the main entities):
- `/api/goals` - Goal management
- `/api/tasks` - Task management  
- `/api/habits` - Habit tracking
- `/api/journal-entries` - Reflection system
- `/api/calendar-events` - Scheduling system

**Relationship Resources** (the connections):
- `/api/goals/{id}/tasks` - Tasks linked to a specific goal
- `/api/goals/{id}/habits` - Habits supporting a goal
- `/api/habits/{id}/completions` - Daily completion records
- `/api/goals/{id}/progress` - Calculated progress metrics

**Dashboard Resources** (aggregated data):
- `/api/dashboard/today` - Today's overview
- `/api/dashboard/week` - Weekly summary
- `/api/analytics/streaks` - Habit streak data

### **Why This Naming Convention Works**

Notice how we use **noun-based URLs** that reflect relationships. When a student wants tasks for a goal, they intuitively know to look at `/api/goals/123/tasks`, not `/api/getTasksByGoal/123`.

---

## **Lesson 2: HTTP Methods & Their Purposes**

### **CRUD Operations (The Basics)**

For each primary resource, we support standard operations:

**Goals Example:**
- `GET /api/goals` → List all goals
- `POST /api/goals` → Create new goal
- `GET /api/goals/{id}` → Get specific goal details
- `PUT /api/goals/{id}` → Update entire goal
- `PATCH /api/goals/{id}` → Partial goal update
- `DELETE /api/goals/{id}` → Archive goal (soft delete)

### **Relationship Operations (The Advanced Stuff)**

Here's where it gets interesting with Project Kage:

**Linking a Task to a Goal:**
- `PUT /api/tasks/{taskId}/goal/{goalId}` → Create link
- `DELETE /api/tasks/{taskId}/goal` → Remove link

**Completing a Habit:**
- `POST /api/habits/{id}/completions` → Mark habit complete for today
- `PUT /api/habits/{id}/completions/{date}` → Update specific day's completion

### **Why We Use Different Methods**

- **POST** when creating new entities or records
- **PUT** when establishing relationships or replacing data
- **PATCH** when updating just part of an entity
- **DELETE** when removing relationships or archiving

---

## **Lesson 3: Response Design Patterns**

### **Single Entity Response**

When someone fetches a goal, they probably want to see related information:

```
GET /api/goals/123 returns:
{
  "id": 123,
  "name": "Get Fit",
  "description": "Improve overall health",
  "progress_percentage": 65.5,
  "status": "active",
  "linked_tasks": [
    {"id": 456, "name": "Buy gym membership", "status": "completed"},
    {"id": 457, "name": "Create workout plan", "status": "pending"}
  ],
  "linked_habits": [
    {"id": 789, "name": "Morning run", "current_streak": 12}
  ],
  "target_date": "2024-12-31"
}
```

**Teaching Point**: Include related data that the UI will immediately need. Don't make the frontend do multiple API calls for basic display.

### **List Response with Metadata**

```
GET /api/goals returns:
{
  "goals": [...],
  "meta": {
    "total_count": 25,
    "active_count": 18,
    "completed_count": 7,
    "page": 1,
    "per_page": 20
  }
}
```

**Teaching Point**: Always include metadata that helps the frontend make decisions (pagination, totals for badges, etc.).

### **Dashboard Response (Aggregated Data)**

```
GET /api/dashboard/today returns:
{
  "date": "2024-07-04",
  "summary": {
    "habits_due": 5,
    "habits_completed": 3,
    "tasks_due": 8,
    "tasks_completed": 5,
    "active_goals": 4
  },
  "urgent_items": [...],
  "streak_celebrations": [...],
  "suggested_actions": [...]
}
```

**Teaching Point**: Dashboard endpoints should return **pre-calculated** data. Don't make the frontend do math - the API should serve ready-to-display information.

---

## **Lesson 4: Handling Complex Updates**

### **The Cascade Problem**

In Project Kage, when you complete a task, several things must happen:
1. Mark task as completed
2. Update goal progress percentage
3. Refresh dashboard metrics
4. Potentially trigger journal prompts
5. Update calendar status

### **Solution: Transaction-Based Updates**

```
POST /api/tasks/456/complete
{
  "completion_notes": "Finished setting up gym membership",
  "trigger_journal_prompt": true
}

Response:
{
  "task": {...updated task...},
  "affected_goal": {...updated goal with new progress...},
  "dashboard_updates": {...new counts...},
  "journal_prompt": "How did completing this task feel? Any insights?"
}
```

**Teaching Point**: When one action affects multiple entities, return **all the updated data** in a single response. This prevents the frontend from making multiple requests to refresh the UI.

### **Batch Operations**

For efficiency, support batch operations:

```
PATCH /api/habits/batch-complete
{
  "completions": [
    {"habit_id": 123, "date": "2024-07-04", "notes": "Great run!"},
    {"habit_id": 124, "date": "2024-07-04", "actual_value": 30}
  ]
}
```

**Teaching Point**: Users often complete multiple habits at once. Batch endpoints are more efficient than individual API calls.

---

## **Lesson 5: Query Parameters & Filtering**

### **Smart Filtering for Connected Data**

```
GET /api/tasks?status=pending&goal_id=123&due_date=today
GET /api/habits?category=health&status=active&has_streak=true
GET /api/journal-entries?linked_to=goal:123&date_range=last_week
```

### **Special Project Kage Filters**

Because everything connects, we need special filters:

```
GET /api/goals?has_overdue_tasks=true
GET /api/habits?linked_to_active_goals=true
GET /api/calendar-events?type=habit&date=2024-07-04
```

**Teaching Point**: Design filters that match how users actually think about their data. "Show me goals with overdue tasks" is a natural mental query.

---

## **Lesson 6: Real-Time Updates & WebSockets**

### **When to Use Real-Time Updates**

Project Kage needs real-time updates for:
- Dashboard counters when items are completed
- Progress bars when linked tasks/habits change
- Streak celebrations when habits are completed
- Calendar updates when items are rescheduled

### **WebSocket Event Design**

```
// When a habit is completed
{
  "event": "habit_completed",
  "data": {
    "habit_id": 123,
    "completion_date": "2024-07-04",
    "new_streak": 15,
    "affected_goal_id": 456,
    "new_goal_progress": 72.5
  }
}

// When goal progress changes
{
  "event": "goal_progress_updated", 
  "data": {
    "goal_id": 456,
    "old_progress": 65.5,
    "new_progress": 72.5,
    "trigger": "habit_completion"
  }
}
```

**Teaching Point**: Real-time events should include **all the data needed** to update the UI. Don't just send "something changed" - send the new values.

---

## **Lesson 7: Error Handling & Validation**

### **Domain-Specific Validation**

Project Kage has unique validation rules:

```
POST /api/habits with invalid frequency:
{
  "error": "validation_failed",
  "details": {
    "frequency_days": ["Cannot set specific days when frequency_type is 'daily'"],
    "target_value": ["Required when frequency_type is 'quantified'"]
  }
}
```

### **Relationship Validation**

```
PUT /api/tasks/123/goal/999 where goal doesn't exist:
{
  "error": "invalid_relationship",
  "message": "Cannot link task to non-existent or archived goal",
  "suggested_action": "Create a new goal or choose from active goals"
}
```

**Teaching Point**: Error messages should be **helpful and actionable**. Tell the user not just what's wrong, but how to fix it.

---

## **Lesson 8: Performance Considerations**

### **The N+1 Query Problem**

Bad approach:
```
GET /api/goals → Returns 20 goals
Then frontend makes 20 calls: GET /api/goals/{id}/tasks
```

Good approach:
```
GET /api/goals?include=tasks,habits,progress
Returns everything in one response with proper joins
```

### **Caching Strategy**

For Project Kage, cache:
- Dashboard data (expires in 5 minutes)
- Goal progress (expires when linked items change)
- Analytics data (expires daily)
- User preferences (expires on update)

**Teaching Point**: Cache **computed data** (like progress percentages) but not **user inputs** (like task names).

---

## **Lesson 9: API Versioning Strategy**

### **When to Version**

For Project Kage, version when:
- Adding AI features (breaking change to response format)
- Changing relationship structures
- Modifying core entity schemas

### **Versioning Pattern**

```
/api/v1/goals → Current stable version
/api/v2/goals → AI-enhanced version with suggestions
```

**Teaching Point**: Version your API when changes would break existing clients, but try to make changes **additive** when possible.

---

## **Final Assignment: Design Challenge**

Now it's your turn! Design the API endpoints for a new feature: **"Smart Scheduling"** where the AI suggests optimal times for habits based on past completion patterns.

Consider:
1. What endpoints do you need?
2. How do they integrate with existing calendar data?
3. What should the response format be?
4. How do you handle updates when the user accepts/rejects suggestions?

Think about the lessons we've covered: relationships, real-time updates, performance, and user experience.

---

## **Key Takeaways**

1. **Design for relationships** - interconnected apps need APIs that reflect those connections
2. **Return complete data** - prevent multiple API calls with smart response design
3. **Handle cascading updates** - one action often affects multiple entities
4. **Cache computed data** - progress calculations are expensive
5. **Make errors helpful** - guide users toward successful actions
6. **Design for real-time** - modern apps need immediate feedback

Remember: API design is about **anticipating how the frontend will use your data**. Always design with the user experience in mind!