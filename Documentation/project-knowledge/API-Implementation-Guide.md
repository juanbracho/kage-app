# Project Kage - API Implementation Guide

**Purpose**: Step-by-step guide for implementing RESTful APIs that support Project Kage's interconnected productivity system

**Target**: Flask developers building the backend API layer

---

## **1. IMPLEMENTATION PHASES**

### **Phase 1: Core Entities (Week 1-2)**
Build basic CRUD operations for primary resources without complex relationships.

### **Phase 2: Linking System (Week 3)**
Implement goal-task-habit linking with cascade updates.

### **Phase 3: Dashboard & Analytics (Week 4)**
Add aggregated endpoints for dashboard and progress tracking.

### **Phase 4: Calendar & Scheduling (Week 5)**
Integrate calendar events and time blocking.

### **Phase 5: Real-time & Advanced Features (Week 6+)**
WebSocket events, batch operations, and optimization.

---

## **2. PHASE 1: CORE ENTITY ENDPOINTS**

### **Goals API (`/api/goals`)**

**Required Endpoints:**
```
GET    /api/goals              - List all goals with basic info
POST   /api/goals              - Create new goal
GET    /api/goals/{id}         - Get goal details
PUT    /api/goals/{id}         - Update entire goal
PATCH  /api/goals/{id}         - Partial goal update
DELETE /api/goals/{id}         - Archive goal (soft delete)
```

**Implementation Notes:**
- Always return `progress_percentage` (calculate on-demand in Phase 1)
- Include `status` field for filtering (active, completed, archived)
- Support icon/emoji and color selection from frontend
- Validate `target_date` is in future for new goals

**Sample Response Structure:**
```json
{
  "id": 123,
  "name": "Get Fit",
  "description": "Improve overall health",
  "icon": "🏃",
  "color": "#FF7101",
  "category": "health",
  "target_date": "2024-12-31",
  "status": "active",
  "progress_percentage": 0.0,
  "created_at": "2024-07-04T10:00:00Z",
  "updated_at": "2024-07-04T10:00:00Z"
}
```

### **Tasks API (`/api/tasks`)**

**Required Endpoints:**
```
GET    /api/tasks              - List tasks with filtering
POST   /api/tasks              - Create new task
GET    /api/tasks/{id}         - Get task details with sub-tasks
PUT    /api/tasks/{id}         - Update task
PATCH  /api/tasks/{id}         - Partial update (status changes)
DELETE /api/tasks/{id}         - Archive task
```

**Implementation Notes:**
- Support `parent_task_id` for sub-tasks
- Include `task_type` (standard, to-buy, deadline)
- Handle `goal_id` foreign key (nullable)
- Validate parent-child relationships (prevent circular references)

**Key Query Parameters:**
- `status` - Filter by pending/completed/archived
- `goal_id` - Filter tasks for specific goal
- `due_date` - Filter by due date (today, overdue, upcoming)
- `include_subtasks` - Include sub-task data in response

### **Habits API (`/api/habits`)**

**Required Endpoints:**
```
GET    /api/habits             - List habits with basic info
POST   /api/habits             - Create new habit
GET    /api/habits/{id}        - Get habit details
PUT    /api/habits/{id}        - Update habit
PATCH  /api/habits/{id}        - Partial update
DELETE /api/habits/{id}        - Archive habit
```

**Implementation Notes:**
- Handle complex `frequency_type` logic (daily, weekly, custom)
- Support `frequency_days` JSON array for weekly habits
- Include `target_value` and `target_unit` for quantified habits
- Validate frequency combinations in business logic

**Frequency Validation Rules:**
- `daily`: frequency_days should be null
- `weekly`: frequency_days required (array of day numbers 1-7)
- `custom`: flexible validation based on frequency_value

---

## **3. PHASE 2: LINKING SYSTEM IMPLEMENTATION**

### **Goal-Task Linking**

**New Endpoints:**
```
GET    /api/goals/{id}/tasks          - Get all tasks for goal
PUT    /api/tasks/{id}/goal/{goalId}  - Link task to goal
DELETE /api/tasks/{id}/goal           - Remove goal link
```

**Implementation Strategy:**
1. Update task record with `goal_id`
2. Recalculate goal progress percentage
3. Return updated goal and task data
4. Log linking action for analytics

**Progress Calculation Logic:**
```python
def calculate_goal_progress(goal_id):
    tasks = get_tasks_for_goal(goal_id)
    if not tasks:
        return 0.0
    
    completed = len([t for t in tasks if t.status == 'completed'])
    total = len([t for t in tasks if t.status in ['pending', 'completed']])
    
    return (completed / total) * 100.0 if total > 0 else 0.0
```

### **Goal-Habit Linking**

**New Endpoints:**
```
GET    /api/goals/{id}/habits         - Get all habits for goal
PUT    /api/habits/{id}/goal/{goalId} - Link habit to goal
DELETE /api/habits/{id}/goal          - Remove goal link
```

**Implementation Strategy:**
- Similar to task linking but consider habit completion rates
- Factor habit streaks into goal progress calculation
- Support multiple habits contributing to single goal

### **Cascade Update System**

**When Task Status Changes:**
1. Update task record
2. Recalculate linked goal progress
3. Update dashboard analytics
4. Trigger real-time events (Phase 5)

**When Goal is Archived:**
1. Optionally unlink all tasks/habits
2. Or maintain links but mark goal as archived
3. Update analytics to exclude archived goals

---

## **4. PHASE 3: DASHBOARD & ANALYTICS**

### **Dashboard Endpoints**

**Required Endpoints:**
```
GET /api/dashboard/today    - Today's overview data
GET /api/dashboard/week     - Weekly summary
GET /api/dashboard/stats    - Overall statistics
```

**Today's Dashboard Implementation:**
```json
{
  "date": "2024-07-04",
  "summary": {
    "habits_due": 5,
    "habits_completed": 3,
    "habits_completion_rate": 60.0,
    "tasks_due": 8,
    "tasks_completed": 5,
    "tasks_completion_rate": 62.5,
    "active_goals": 4,
    "goals_with_progress_today": 2
  },
  "urgent_items": [
    {"type": "task", "id": 123, "name": "Submit report", "due": "today"},
    {"type": "habit", "id": 456, "name": "Morning run", "streak_risk": true}
  ],
  "achievements": [
    {"type": "streak", "habit_name": "Reading", "streak_count": 30}
  ]
}
```

**Performance Optimization:**
- Pre-calculate daily stats in background job
- Cache dashboard data for 5-10 minutes
- Use database views for complex aggregations

### **Progress Tracking Endpoints**

**Required Endpoints:**
```
GET /api/goals/{id}/progress       - Detailed goal progress
GET /api/habits/{id}/streaks       - Habit streak information
GET /api/analytics/trends          - Weekly/monthly trends
```

**Habit Streak Calculation:**
```python
def calculate_habit_streak(habit_id, as_of_date=None):
    completions = get_habit_completions(habit_id, as_of_date)
    current_streak = 0
    longest_streak = 0
    
    # Implementation logic for streak calculation
    # Consider habit frequency when counting streaks
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "completion_rate": calculate_completion_rate(completions),
        "last_completed": get_last_completion_date(completions)
    }
```

---

## **5. PHASE 4: CALENDAR & SCHEDULING**

### **Calendar Events API**

**Required Endpoints:**
```
GET    /api/calendar/events        - Get events for date range
POST   /api/calendar/events        - Create calendar event
PUT    /api/calendar/events/{id}   - Update event (reschedule)
DELETE /api/calendar/events/{id}   - Remove event
```

**Implementation Strategy:**
- Auto-create events when tasks/habits are scheduled
- Support drag-and-drop rescheduling via PUT requests
- Handle recurring events for habits
- Integrate with goal deadlines

**Date Range Query:**
```
GET /api/calendar/events?start_date=2024-07-01&end_date=2024-07-07&types=task,habit
```

**Response includes linked entity data:**
```json
{
  "events": [
    {
      "id": 123,
      "title": "Morning Run",
      "event_type": "habit",
      "start_date": "2024-07-04",
      "start_time": "07:00",
      "linked_habit": {
        "id": 456,
        "name": "Morning Run",
        "current_streak": 12
      }
    }
  ]
}
```

### **Time Blocking API**

**Required Endpoints:**
```
GET    /api/time-blocks           - Get time blocks for date range
POST   /api/time-blocks           - Create focus session
PUT    /api/time-blocks/{id}      - Update time block
PATCH  /api/time-blocks/{id}/complete - Mark session complete
```

**Implementation Notes:**
- Support overlapping detection
- Track actual vs planned time
- Link to specific tasks or goals
- Calculate productivity metrics

---

## **6. PHASE 5: REAL-TIME & ADVANCED FEATURES**

### **WebSocket Event System**

**Event Types to Implement:**
```
habit_completed         - When habit is marked complete
task_completed         - When task is finished
goal_progress_updated  - When goal progress changes
streak_milestone       - When habit reaches streak goal
```

**Event Payload Structure:**
```json
{
  "event": "habit_completed",
  "timestamp": "2024-07-04T14:30:00Z",
  "data": {
    "habit_id": 123,
    "completion_date": "2024-07-04",
    "new_streak": 15,
    "affected_goals": [
      {"goal_id": 456, "new_progress": 72.5}
    ]
  }
}
```

### **Batch Operations**

**Required Endpoints:**
```
POST /api/habits/batch-complete    - Complete multiple habits
POST /api/tasks/batch-update       - Update multiple tasks
POST /api/calendar/batch-reschedule - Reschedule multiple events
```

**Batch Completion Implementation:**
```json
{
  "completions": [
    {
      "habit_id": 123,
      "completion_date": "2024-07-04",
      "actual_value": 30,
      "notes": "Great session!"
    },
    {
      "habit_id": 124,
      "completion_date": "2024-07-04",
      "mood_rating": 4
    }
  ]
}
```

**Response includes all affected data:**
```json
{
  "completed_habits": [...],
  "updated_goals": [...],
  "new_streaks": [...],
  "dashboard_updates": {...}
}
```

---

## **7. IMPLEMENTATION BEST PRACTICES**

### **Error Handling Standards**

**Validation Errors:**
```json
{
  "error": "validation_failed",
  "message": "Invalid input data",
  "details": {
    "name": ["Name is required"],
    "target_date": ["Target date must be in the future"]
  }
}
```

**Relationship Errors:**
```json
{
  "error": "invalid_relationship",
  "message": "Cannot link task to archived goal",
  "suggested_action": "Choose an active goal or create a new one"
}
```

### **Performance Guidelines**

**Query Optimization:**
- Use eager loading for related data (`JOIN` queries)
- Implement pagination for list endpoints
- Cache expensive calculations (goal progress, streaks)
- Use database indexes on frequently filtered columns

**Response Size Management:**
- Default to essential data only
- Use `include` query parameter for related data
- Implement field selection (`fields=id,name,status`)
- Paginate large result sets

### **Security Considerations**

**Input Validation:**
- Validate all foreign key references
- Sanitize user input (names, descriptions)
- Limit file upload sizes (icons)
- Rate limit API endpoints

**Data Access:**
- Implement user-based data isolation
- Validate user permissions for linked resources
- Audit logging for sensitive operations
- Secure API key management

---

## **8. TESTING STRATEGY**

### **Unit Tests (Per Endpoint)**
- Valid input/output scenarios
- Error condition handling
- Business logic validation
- Database constraint testing

### **Integration Tests (Cross-Feature)**
- Goal-task linking workflows
- Progress calculation accuracy
- Calendar integration
- Real-time event triggering

### **Performance Tests**
- Dashboard loading under load
- Batch operation efficiency
- Database query optimization
- Cache hit/miss ratios

---

## **9. DEPLOYMENT CHECKLIST**

### **Database Setup**
- [ ] Run schema migrations
- [ ] Create database indexes
- [ ] Set up backup procedures
- [ ] Configure connection pooling

### **API Configuration**
- [ ] Set up environment variables
- [ ] Configure rate limiting
- [ ] Enable API logging
- [ ] Set up monitoring

### **Caching Layer**
- [ ] Configure Redis/Memcached
- [ ] Set cache expiration policies
- [ ] Implement cache invalidation
- [ ] Monitor cache performance

This implementation guide provides a clear roadmap for building Project Kage's API layer systematically, with practical examples and best practices for each phase.