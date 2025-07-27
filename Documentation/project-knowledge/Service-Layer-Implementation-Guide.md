# Project Kage - Service Layer Implementation Guide

**Purpose**: Practical guide for implementing business logic services that support Project Kage's interconnected features

**Target**: Flask developers building the service layer between APIs and database models

---

## **1. SERVICE LAYER ARCHITECTURE**

### **Directory Structure**
```
app/
├── services/
│   ├── __init__.py
│   ├── base_service.py          # Base class with common functionality
│   ├── goal_service.py          # Goal-related business logic
│   ├── task_service.py          # Task management and completion
│   ├── habit_service.py         # Habit tracking and streaks
│   ├── journal_service.py       # Reflection and auto-prompts
│   ├── calendar_service.py      # Scheduling and time blocks
│   ├── dashboard_service.py     # Data aggregation
│   ├── analytics_service.py     # Metrics and insights
│   └── notification_service.py  # Future: notifications and reminders
```

### **Service Layer Principles**
1. **Single Responsibility**: Each service handles one business domain
2. **Transaction Management**: Services manage database transactions
3. **Error Handling**: Services raise domain-specific exceptions
4. **No HTTP Concerns**: Services don't know about requests/responses
5. **Testable**: Pure business logic that's easy to unit test

---

## **2. BASE SERVICE IMPLEMENTATION**

### **BaseService Class**

```python
# app/services/base_service.py
from abc import ABC
from typing import Optional, Dict, Any
from flask import current_app
from app.extensions import db
from app.exceptions import BusinessLogicError, NotFoundError

class BaseService(ABC):
    """Base service with common functionality for all domain services"""
    
    @staticmethod
    def _commit_or_rollback():
        """Safely commit database changes or rollback on error"""
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Database error: {str(e)}")
            raise BusinessLogicError("Database operation failed")
    
    @staticmethod
    def _get_or_404(model_class, entity_id: int, error_message: str = None):
        """Get entity by ID or raise NotFoundError"""
        entity = model_class.query.get(entity_id)
        if not entity:
            message = error_message or f"{model_class.__name__} not found"
            raise NotFoundError(message)
        return entity
    
    @staticmethod
    def _validate_status_transition(current_status: str, new_status: str, valid_transitions: Dict[str, list]):
        """Validate that status transition is allowed"""
        if new_status not in valid_transitions.get(current_status, []):
            raise BusinessLogicError(f"Cannot transition from {current_status} to {new_status}")
```

### **Custom Exceptions**

```python
# app/exceptions.py
class BusinessLogicError(Exception):
    """Raised when business rules are violated"""
    pass

class NotFoundError(Exception):
    """Raised when requested entity doesn't exist"""
    pass

class ValidationError(Exception):
    """Raised when input validation fails"""
    pass

class PermissionError(Exception):
    """Raised when user lacks permission for operation"""
    pass
```

---

## **3. CORE DOMAIN SERVICES**

### **GoalService - Central Hub Operations**

```python
# app/services/goal_service.py
from typing import List, Optional, Dict, Any
from app.services.base_service import BaseService
from app.models import Goal, Task, Habit
from app.exceptions import BusinessLogicError, ValidationError

class GoalService(BaseService):
    """Business logic for goal management and progress tracking"""
    
    @staticmethod
    def create_goal(name: str, description: str = None, **kwargs) -> Goal:
        """Create a new goal with validation"""
        # Validate required fields
        if not name or len(name.strip()) < 3:
            raise ValidationError("Goal name must be at least 3 characters")
        
        # Validate target date
        target_date = kwargs.get('target_date')
        if target_date and target_date <= date.today():
            raise ValidationError("Target date must be in the future")
        
        goal = Goal(
            name=name.strip(),
            description=description,
            **kwargs
        )
        
        db.session.add(goal)
        GoalService._commit_or_rollback()
        
        current_app.logger.info(f"Created goal: {goal.name} (ID: {goal.id})")
        return goal
    
    @staticmethod
    def calculate_progress(goal_id: int) -> float:
        """Calculate goal progress based on linked tasks and habits"""
        goal = GoalService._get_or_404(Goal, goal_id, "Goal not found for progress calculation")
        
        # Get linked tasks
        linked_tasks = Task.query.filter_by(
            goal_id=goal_id,
            status__in=['pending', 'completed']
        ).all()
        
        # Get linked habits with recent completions
        linked_habits = Habit.query.filter_by(
            goal_id=goal_id,
            status='active'
        ).all()
        
        if not linked_tasks and not linked_habits:
            return 0.0
        
        # Calculate task completion percentage
        task_progress = 0.0
        if linked_tasks:
            completed_tasks = [t for t in linked_tasks if t.status == 'completed']
            task_progress = len(completed_tasks) / len(linked_tasks)
        
        # Calculate habit consistency (simplified)
        habit_progress = 0.0
        if linked_habits:
            from app.services.habit_service import HabitService
            habit_scores = []
            for habit in linked_habits:
                streak_data = HabitService.get_streak_info(habit.id)
                # Convert streak to progress score (this is domain-specific logic)
                score = min(streak_data['current_streak'] / habit.streak_goal, 1.0) if habit.streak_goal else 0.5
                habit_scores.append(score)
            habit_progress = sum(habit_scores) / len(habit_scores)
        
        # Weighted average (tasks 70%, habits 30%)
        if linked_tasks and linked_habits:
            progress = (task_progress * 0.7) + (habit_progress * 0.3)
        elif linked_tasks:
            progress = task_progress
        else:
            progress = habit_progress
        
        # Update goal progress
        goal.progress_percentage = round(progress * 100, 2)
        GoalService._commit_or_rollback()
        
        return goal.progress_percentage
    
    @staticmethod
    def archive_goal(goal_id: int, archive_linked_items: bool = False) -> Dict[str, Any]:
        """Archive a goal and optionally its linked items"""
        goal = GoalService._get_or_404(Goal, goal_id)
        
        if goal.status == 'archived':
            raise BusinessLogicError("Goal is already archived")
        
        archived_items = {
            'goal': goal.name,
            'tasks_archived': 0,
            'habits_archived': 0
        }
        
        # Archive linked items if requested
        if archive_linked_items:
            # Archive linked tasks
            linked_tasks = Task.query.filter_by(goal_id=goal_id, status__ne='archived').all()
            for task in linked_tasks:
                task.status = 'archived'
                task.archived_at = datetime.utcnow()
                archived_items['tasks_archived'] += 1
            
            # Archive linked habits
            linked_habits = Habit.query.filter_by(goal_id=goal_id, status__ne='archived').all()
            for habit in linked_habits:
                habit.status = 'archived'
                habit.archived_at = datetime.utcnow()
                archived_items['habits_archived'] += 1
        
        # Archive the goal
        goal.status = 'archived'
        goal.archived_at = datetime.utcnow()
        
        GoalService._commit_or_rollback()
        
        current_app.logger.info(f"Archived goal {goal.name} and {archived_items['tasks_archived']} tasks, {archived_items['habits_archived']} habits")
        return archived_items
```

### **TaskService - Task Management Logic**

```python
# app/services/task_service.py
from typing import Dict, Any, Optional
from datetime import datetime, date
from app.services.base_service import BaseService
from app.services.goal_service import GoalService
from app.models import Task, Goal

class TaskService(BaseService):
    """Business logic for task management and completion"""
    
    VALID_STATUS_TRANSITIONS = {
        'pending': ['completed', 'archived'],
        'completed': ['pending', 'archived'],
        'archived': ['pending']  # Can restore from archive
    }
    
    @staticmethod
    def complete_task(task_id: int, completion_notes: str = None, 
                     trigger_journal_prompt: bool = False) -> Dict[str, Any]:
        """Complete a task and handle all cascade updates"""
        
        # Get task and validate
        task = TaskService._get_or_404(Task, task_id, "Task not found")
        
        if task.status == 'completed':
            raise BusinessLogicError("Task is already completed")
        
        if task.status == 'archived':
            raise BusinessLogicError("Cannot complete archived task")
        
        # Begin transaction for multiple updates
        try:
            # Update task
            task.status = 'completed'
            task.completed_at = datetime.utcnow()
            if completion_notes:
                task.completion_notes = completion_notes
            
            result = {
                'task': {
                    'id': task.id,
                    'name': task.name,
                    'status': task.status,
                    'completed_at': task.completed_at.isoformat()
                },
                'affected_goal': None,
                'journal_prompt': None
            }
            
            # Update linked goal progress
            if task.goal_id:
                new_progress = GoalService.calculate_progress(task.goal_id)
                goal = Goal.query.get(task.goal_id)
                result['affected_goal'] = {
                    'id': goal.id,
                    'name': goal.name,
                    'progress_percentage': new_progress
                }
            
            # Create journal prompt if requested
            if trigger_journal_prompt:
                from app.services.journal_service import JournalService
                prompt = JournalService.create_completion_prompt(task)
                result['journal_prompt'] = prompt
            
            # Update analytics
            from app.services.analytics_service import AnalyticsService
            AnalyticsService.increment_task_completion(date.today())
            
            TaskService._commit_or_rollback()
            
            current_app.logger.info(f"Completed task: {task.name} (ID: {task.id})")
            return result
            
        except Exception as e:
            db.session.rollback()
            raise BusinessLogicError(f"Failed to complete task: {str(e)}")
    
    @staticmethod
    def create_subtask(parent_task_id: int, name: str, **kwargs) -> Task:
        """Create a subtask linked to a parent task"""
        parent_task = TaskService._get_or_404(Task, parent_task_id, "Parent task not found")
        
        # Inherit goal from parent if not specified
        if 'goal_id' not in kwargs and parent_task.goal_id:
            kwargs['goal_id'] = parent_task.goal_id
        
        subtask = Task(
            name=name,
            parent_task_id=parent_task_id,
            **kwargs
        )
        
        db.session.add(subtask)
        TaskService._commit_or_rollback()
        
        return subtask
```

### **HabitService - Streak and Completion Logic**

```python
# app/services/habit_service.py
from typing import Dict, Any, List
from datetime import date, datetime, timedelta
from app.services.base_service import BaseService
from app.models import Habit, HabitCompletion, HabitStreak

class HabitService(BaseService):
    """Business logic for habit tracking, streaks, and completions"""
    
    @staticmethod
    def complete_habit(habit_id: int, completion_date: date = None, 
                      actual_value: int = None, notes: str = None) -> Dict[str, Any]:
        """Complete a habit and update streaks"""
        
        habit = HabitService._get_or_404(Habit, habit_id, "Habit not found")
        completion_date = completion_date or date.today()
        
        # Check if already completed for this date
        existing_completion = HabitCompletion.query.filter_by(
            habit_id=habit_id,
            completion_date=completion_date
        ).first()
        
        if existing_completion:
            raise BusinessLogicError(f"Habit already completed for {completion_date}")
        
        try:
            # Create completion record
            completion = HabitCompletion(
                habit_id=habit_id,
                completion_date=completion_date,
                completed=True,
                actual_value=actual_value,
                notes=notes
            )
            db.session.add(completion)
            
            # Update streak information
            streak_info = HabitService._update_streak(habit_id, completion_date)
            
            # Update goal progress if linked
            if habit.goal_id:
                from app.services.goal_service import GoalService
                new_progress = GoalService.calculate_progress(habit.goal_id)
            
            # Update analytics
            from app.services.analytics_service import AnalyticsService
            AnalyticsService.increment_habit_completion(completion_date)
            
            HabitService._commit_or_rollback()
            
            result = {
                'habit': {
                    'id': habit.id,
                    'name': habit.name,
                    'completion_date': completion_date.isoformat()
                },
                'streak_info': streak_info,
                'milestone_reached': streak_info['current_streak'] > 0 and 
                                   streak_info['current_streak'] % habit.streak_goal == 0
            }
            
            current_app.logger.info(f"Completed habit: {habit.name} for {completion_date}")
            return result
            
        except Exception as e:
            db.session.rollback()
            raise BusinessLogicError(f"Failed to complete habit: {str(e)}")
    
    @staticmethod
    def _update_streak(habit_id: int, completion_date: date) -> Dict[str, Any]:
        """Update habit streak information"""
        habit = Habit.query.get(habit_id)
        
        # Get or create streak record
        streak_record = HabitStreak.query.filter_by(habit_id=habit_id).first()
        if not streak_record:
            streak_record = HabitStreak(habit_id=habit_id)
            db.session.add(streak_record)
        
        # Calculate new streak based on habit frequency
        current_streak = HabitService._calculate_current_streak(habit_id, completion_date)
        
        # Update streak record
        streak_record.current_streak = current_streak
        streak_record.last_completion_date = completion_date
        streak_record.total_completions += 1
        
        if current_streak > streak_record.longest_streak:
            streak_record.longest_streak = current_streak
        
        # Calculate completion rate
        days_since_creation = (completion_date - habit.created_at.date()).days + 1
        expected_completions = HabitService._calculate_expected_completions(habit, days_since_creation)
        streak_record.completion_rate = (streak_record.total_completions / expected_completions * 100) if expected_completions > 0 else 0
        
        streak_record.updated_at = datetime.utcnow()
        
        return {
            'current_streak': streak_record.current_streak,
            'longest_streak': streak_record.longest_streak,
            'total_completions': streak_record.total_completions,
            'completion_rate': round(streak_record.completion_rate, 2)
        }
    
    @staticmethod
    def _calculate_current_streak(habit_id: int, completion_date: date) -> int:
        """Calculate current streak based on habit frequency"""
        habit = Habit.query.get(habit_id)
        
        # Get recent completions in reverse chronological order
        recent_completions = HabitCompletion.query.filter_by(
            habit_id=habit_id,
            completed=True
        ).filter(
            HabitCompletion.completion_date <= completion_date
        ).order_by(HabitCompletion.completion_date.desc()).limit(100).all()
        
        if not recent_completions:
            return 1  # First completion
        
        # Streak calculation depends on habit frequency
        if habit.frequency_type == 'daily':
            return HabitService._calculate_daily_streak(recent_completions, completion_date)
        elif habit.frequency_type == 'weekly':
            return HabitService._calculate_weekly_streak(recent_completions, completion_date, habit.frequency_days)
        else:
            return HabitService._calculate_custom_streak(recent_completions, completion_date, habit)
    
    @staticmethod
    def get_habits_due_today(user_id: int = None) -> List[Dict[str, Any]]:
        """Get habits that should be completed today"""
        today = date.today()
        today_weekday = today.weekday() + 1  # Convert to 1-7 format
        
        # Build query
        query = Habit.query.filter_by(status='active')
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        habits = query.all()
        due_habits = []
        
        for habit in habits:
            is_due = False
            
            if habit.frequency_type == 'daily':
                is_due = True
            elif habit.frequency_type == 'weekly' and habit.frequency_days:
                is_due = today_weekday in habit.frequency_days
            elif habit.frequency_type == 'custom':
                # Custom logic based on frequency_value
                is_due = HabitService._is_custom_habit_due(habit, today)
            
            if is_due:
                # Check if already completed today
                completion = HabitCompletion.query.filter_by(
                    habit_id=habit.id,
                    completion_date=today
                ).first()
                
                if not completion:
                    streak_info = HabitService.get_streak_info(habit.id)
                    due_habits.append({
                        'id': habit.id,
                        'name': habit.name,
                        'icon': habit.icon,
                        'color': habit.color,
                        'current_streak': streak_info['current_streak'],
                        'target_value': habit.target_value,
                        'target_unit': habit.target_unit
                    })
        
        return due_habits
```

---

## **4. AGGREGATION SERVICES**

### **DashboardService - Data Orchestrator**

**Purpose**: Combine data from multiple domain services for dashboard display

**Key Responsibilities**:
- Aggregate today's metrics from Goals, Tasks, Habits services
- Calculate urgent items (overdue tasks, at-risk streaks)
- Format data for immediate dashboard consumption
- Cache expensive calculations

**Implementation Strategy**:
- Call individual domain services rather than direct database queries
- Use Redis caching for dashboard data (5-10 minute expiration)
- Pre-calculate common metrics in background jobs
- Return data in format that matches frontend needs exactly

**Performance Considerations**:
- Single aggregation query rather than N+1 service calls
- Background job updates daily analytics table
- Cache invalidation when underlying data changes

### **AnalyticsService - Metrics Calculator**

**Purpose**: Handle complex calculations for progress tracking and insights

**Key Responsibilities**:
- Calculate goal progress using weighted algorithms
- Track habit consistency and patterns
- Generate productivity scores and trends
- Maintain daily/weekly/monthly rollups

**Business Logic Decisions**:
- Goal progress: 70% tasks, 30% habits (configurable)
- Streak calculation considers habit frequency patterns
- Productivity score combines completion rate + consistency
- Analytics data retained for 2 years, then archived

---

## **5. SERVICE INTERACTION PATTERNS**

### **Orchestration Pattern (Recommended)**

**When to Use**: Complex operations affecting multiple domains

**Example**: Completing a task triggers:
1. TaskService updates task status
2. GoalService recalculates progress
3. AnalyticsService increments counters
4. JournalService creates optional prompt

**Implementation Approach**:
- One service acts as orchestrator (usually the primary domain)
- Orchestrator calls other services in sequence
- All operations wrapped in single database transaction
- Clear error handling and rollback strategy

### **Event-Driven Pattern (Future)**

**When to Use**: Loose coupling between services

**Example**: Task completion publishes event, subscribers react:
- GoalService listens for task_completed events
- AnalyticsService listens for all completion events
- NotificationService listens for milestone events

**Implementation Considerations**:
- Requires event bus (Redis pub/sub or message queue)
- Better for scaling but adds complexity
- Consider for Phase 5 when adding real-time features

---

## **6. TRANSACTION MANAGEMENT**

### **Service-Level Transactions**

**Pattern**: Each service method manages its own transaction boundary

**Benefits**:
- Clear transaction scope
- Easy rollback on business logic errors
- Prevents partial updates across multiple entities

**Implementation Guidelines**:
- Use database context managers for automatic rollback
- Catch business logic exceptions and convert to user-friendly messages
- Log transaction failures for debugging
- Never let database exceptions reach the API layer

### **Cross-Service Transactions**

**Challenge**: When one operation affects multiple services

**Solution Options**:
1. **Single Service Orchestration**: One service calls others within its transaction
2. **Saga Pattern**: Chain of compensating transactions
3. **Two-Phase Commit**: Distributed transaction (overkill for Project Kage)

**Recommended Approach**: Single service orchestration for simplicity

---

## **7. ERROR HANDLING STRATEGY**

### **Exception Hierarchy**

**Business Logic Exceptions**: Things users can fix
- ValidationError: Invalid input data
- BusinessLogicError: Violated business rules
- PermissionError: User lacks access

**System Exceptions**: Technical problems
- DatabaseError: Connection or constraint issues
- ExternalServiceError: Third-party API failures
- ConfigurationError: Missing settings

### **Error Propagation Pattern**

**Services → Controllers → API Response**

1. **Services**: Raise domain-specific exceptions with clear messages
2. **Controllers**: Catch service exceptions, convert to HTTP responses
3. **API**: Return consistent error format with actionable messages

**Implementation Notes**:
- Services never return HTTP status codes
- Error messages should guide user toward resolution
- Include error context for debugging (request ID, user ID, etc.)

---

## **8. TESTING STRATEGY**

### **Service Testing Approach**

**Unit Tests** (Fast, Isolated):
- Test business logic with mocked dependencies
- Focus on edge cases and error conditions
- Use in-memory database for speed

**Integration Tests** (Realistic):
- Test service interactions with real database
- Verify transaction rollback behavior
- Test complex workflows end-to-end

**Contract Tests** (Interface Validation):
- Ensure service interfaces don't break
- Test input/output formats
- Validate exception handling

### **Testing Best Practices**

**Test Data Management**:
- Use factories for consistent test data creation
- Clean database between tests
- Isolate tests from each other

**Mock Strategy**:
- Mock external services (email, notifications)
- Don't mock domain services (test real interactions)
- Mock time-dependent operations for consistency

---

## **9. PERFORMANCE OPTIMIZATION**

### **Caching Strategy**

**What to Cache**:
- Dashboard aggregations (expensive calculations)
- Goal progress percentages (frequently accessed)
- User settings and preferences
- Analytics rollups (daily/weekly summaries)

**What NOT to Cache**:
- Individual entity data (changes frequently)
- User inputs (always fresh from database)
- Real-time completion status

**Cache Invalidation**:
- Time-based expiration for aggregated data
- Event-based invalidation for dependent data
- Manual cache clearing for analytics recalculation

### **Query Optimization**

**Service-Level Optimizations**:
- Eager load related entities in single query
- Use database views for complex analytics
- Implement pagination for large result sets
- Pre-calculate expensive metrics in background jobs

**Database Interaction Patterns**:
- Batch operations for multiple updates
- Use database triggers for automatic calculations
- Implement soft deletes for data retention
- Create indexes on frequently filtered columns

---

## **10. IMPLEMENTATION PHASES**

### **Phase 1: Core Services (Week 1-2)**
- Implement BaseService with common functionality
- Build GoalService, TaskService, HabitService with basic operations
- Focus on business logic, not optimization
- Add comprehensive unit tests

### **Phase 2: Service Integration (Week 3)**
- Implement cross-service operations (goal progress, task completion)
- Add transaction management and error handling
- Build DashboardService for data aggregation
- Add integration tests for service interactions

### **Phase 3: Optimization (Week 4)**
- Add caching layer for expensive operations
- Implement background jobs for analytics
- Optimize database queries and add indexes
- Performance testing and bottleneck identification

### **Phase 4: Advanced Features (Week 5+)**
- Add AnalyticsService for complex calculations
- Implement batch operations and bulk updates
- Add audit logging for business operations
- Consider event-driven patterns for real-time features

---

## **11. DEPLOYMENT CONSIDERATIONS**

### **Configuration Management**
- Business rule parameters (goal progress weights, streak thresholds)
- Cache timeout values and database connection pools
- Background job schedules and retry policies
- Feature flags for gradual rollout

### **Monitoring and Logging**
- Service method performance metrics
- Business operation audit trails
- Error rates and exception tracking
- Cache hit/miss ratios and database query performance

### **Scalability Preparation**
- Design services to be stateless
- Use dependency injection for database connections
- Implement rate limiting for expensive operations
- Plan for horizontal scaling of background jobs

This approach focuses on architectural decisions, patterns, and implementation strategies rather than specific code, making it more valuable for developers who need to understand the system design and make informed implementation choices.