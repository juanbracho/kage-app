# Dashboard Page Documentation

## Purpose
The Dashboard page serves as the main overview for the user, providing a summary of their goals, tasks, habits, and journal activity. It is designed to give users a quick snapshot of their productivity and recent activity, as well as easy access to key actions and navigation to other sections of the app.

## Features & Functionality
- **Greeting Section:** Displays a personalized greeting based on the time of day (morning, afternoon, evening) and the user's name (currently placeholder, as user authentication is not yet implemented).
- **Dashboard Grid:** Contains interactive cards for:
  - **Goals:** Shows the number of active goals, how many are due today, and a progress bar for today's goals.
  - **Tasks:** Displays the number of tasks due today, tasks for the week, and a progress bar for completed tasks today.
  - **Habits:** Indicates the number of habits completed today, total habits for today, and a progress bar for habit completion.
  - **Journal:** Shows the number of journal entries today and for the week.
  - **Quick Actions:** Provides buttons to quickly create a new goal, task, habit, or journal entry.
- **Recent Activity:**
  - **Latest Journal Entries:** Shows up to three of the most recent journal entries from the past week, including mood rating and a content preview.
  - **Current Streaks:** Displays up to three current habit streaks, showing the habit name and streak length.

## Desired Workflow
1. User lands on the Dashboard after logging in (authentication to be implemented).
2. User reviews the greeting and summary cards to get an overview of their day and week.
3. User can click on any card to navigate to the detailed page for goals, tasks, habits, or journal.
4. User can use Quick Actions to add new items directly from the dashboard.
5. User reviews recent activity and streaks for motivation and tracking.

## Business Logic
- Data for the dashboard is gathered in the backend (`routes/dashboard.py`):
  - Determines greeting based on current time.
  - Fetches active goals and counts those due today.
  - Counts tasks due today, completed today, and tasks for the week.
  - Counts active habits and completed habits for today.
  - Fetches recent journal entries (last 7 days, up to 3 entries).
  - Counts journal entries for today.
- All data is passed to the template for rendering. No user authentication is currently implemented, so `user_name` is always `None`.
- The `/dashboard/stats` endpoint provides a JSON API for dashboard statistics (not currently used in the template).

## Design Considerations
- The dashboard uses a grid layout for summary cards, styled with `dashboard.css` for a clean, modern look.
- Cards use icons and color highlights for quick visual recognition.
- The layout is responsive and centers the dashboard content for readability.
- Quick Actions are grouped for fast access to creation flows.
- Recent activity and streaks are shown only if there is data to display.

## Special Notes
- The dashboard is currently single-user and does not support authentication or user-specific data.
- The greeting and user name are placeholders for future user system integration.
- The JavaScript file (`dashboard.js`) is mostly a stub, with a placeholder for future interactive features (e.g., dashboard filters).
- All business logic for dashboard data is handled server-side in the route; the template is responsible for display and navigation.
- The dashboard is intended to be the user's daily hub, encouraging engagement and providing motivation through progress and streaks.

---

# Calendar Page Documentation

## Purpose
The Calendar page provides a comprehensive view of the user's schedule, tasks, habits, and goals across different time periods (day, week, month). It serves as a central planning and tracking interface, allowing users to visualize their commitments and progress over time.

## Features & Functionality
- **Multi-View Calendar:** Three different calendar views:
  - **Day View:** Hourly timeline showing tasks and habits scheduled for specific times.
  - **Week View:** Weekly grid showing daily activities and commitments.
  - **Month View:** Monthly overview with daily summaries and events.
- **Navigation Controls:** 
  - View tabs to switch between day, week, and month views.
  - Previous/next period navigation buttons.
  - Current period display (e.g., "Monday, January 15, 2024" for day view).
- **Statistics Bar:** Shows summary statistics for the current view:
  - Number of tasks
  - Number of habits
  - Number of completed items
- **Interactive Elements:**
  - Clickable time slots in day view for adding new items.
  - Event items that can be marked as completed by clicking.
  - Quick add button for creating new items.
- **Event Display:** Different types of events are color-coded:
  - Tasks: Blue background with task icon
  - Habits: Yellow background with habit icon
  - Completed items: Strikethrough and reduced opacity

## Desired Workflow
1. User navigates to the Calendar page and selects their preferred view (day/week/month).
2. User reviews their schedule and commitments for the selected period.
3. User can navigate between different periods using the navigation controls.
4. User can click on empty time slots to add new tasks or habits.
5. User can mark events as completed by clicking on them.
6. User can use the quick add button to create new items without navigating away.

## Business Logic
- **Date Handling:** The calendar uses Python's `datetime` and `date` modules for all date calculations:
  - Day view: Shows a single day with hourly slots (6:00 AM to 9:00 PM).
  - Week view: Shows Sunday to Saturday with time slots.
  - Month view: Shows a full month grid starting on Sunday.
- **Data Fetching:** The backend (`routes/calendar.py`) fetches:
  - Tasks due in the selected period with pending status.
  - Active habits and their completion status for the period.
  - Goals with target dates in the selected period.
  - Habit completions for tracking progress.
- **Period Calculations:** 
  - Previous/next period dates are calculated based on the current view.
  - Week view always shows Sunday to Saturday regardless of the selected date.
  - Month view shows a complete month grid with proper day numbering.
- **Event Scheduling:** Tasks and habits are displayed based on their due times and preferred times respectively.

## Design Considerations
- **Responsive Layout:** The calendar adapts to different screen sizes with mobile-friendly controls.
- **Visual Hierarchy:** Clear distinction between different view types and event types.
- **Color Coding:** Consistent color scheme for different event types (tasks, habits, completed).
- **Interactive Feedback:** Hover effects and click states for interactive elements.
- **Empty States:** Clear messaging for empty time slots ("Tap to add").
- **Navigation:** Intuitive navigation between periods and views.

## Special Notes
- The calendar is currently single-user and does not support user authentication.
- The JavaScript file (`calendar.js`) has been simplified to remove client-side view switching, as all views are now server-rendered.
- Event completion toggling is handled client-side with null checks for safety.
- The calendar supports both time-based scheduling (for tasks with due times) and daily habits.
- The quick add button is present but functionality needs to be implemented.
- All date calculations and period navigation are handled server-side for consistency.
- The calendar is designed to be the primary scheduling interface, integrating with tasks, habits, and goals.

---

# Habits Page Documentation

## Purpose
The Habits page serves as the central hub for managing and tracking daily habits and routines. It provides users with tools to create, monitor, and maintain positive habits through visual tracking, streak counting, and progress analytics. The page emphasizes habit formation through consistent tracking and motivational feedback.

## Features & Functionality
- **Dual View Modes:**
  - **Grid View:** Visual habit cards with 7-day completion grid and streak information.
  - **List View:** Detailed list with habit descriptions and completion buttons.
- **Habit Management:**
  - Create new habits with comprehensive configuration options.
  - Edit existing habits and their settings.
  - Archive or delete habits.
  - Mark habits as completed/uncompleted for today.
- **Visual Tracking:**
  - 7-day completion grid showing daily completion status.
  - Current streak counter with fire icon.
  - Completion rate percentage (30-day average).
  - Color-coded habit cards with custom icons.
- **Habit Creation Modal:**
  - Icon selection from predefined set (16 options).
  - Color customization (6 preset colors + custom).
  - Measurement types: Simple (yes/no), Count, Time, Custom.
  - Frequency options: Daily, Weekly (select days), Custom.
  - Goal linking capability.
  - Scheduling options (start date, preferred time, reminders).
- **Progress Analytics:**
  - Current streak tracking.
  - 30-day completion rate calculation.
  - Visual progress indicators.

## Desired Workflow
1. User navigates to the Habits page and sees their active habits in grid or list view.
2. User can toggle between grid and list views based on preference.
3. User clicks the "+" button to create a new habit, opening the comprehensive creation modal.
4. User configures the habit with name, description, icon, color, measurement type, frequency, and optional goal linking.
5. User can mark habits as completed for today by clicking the completion button.
6. User can view detailed progress and edit habits by accessing individual habit cards.
7. User tracks progress through visual indicators and analytics.

## Business Logic
- **Data Management:** The backend (`routes/habits.py`) handles:
  - Fetching active habits and their completion data.
  - Calculating current streaks for each habit.
  - Computing 30-day completion rates.
  - Managing habit creation, editing, and deletion.
  - Handling completion/uncompletion for today.
- **Streak Calculation:** 
  - Counts consecutive days of completion from today backwards.
  - Resets when a day is missed.
  - Updates in real-time when habits are completed/uncompleted.
- **Completion Rate:** 
  - Calculates percentage of completed days over the last 30 days.
  - Provides motivation and progress tracking.
- **Habit Configuration:**
  - Supports multiple measurement types (simple, count, time, custom).
  - Flexible frequency options (daily, weekly with day selection, custom).
  - Goal linking for habit-goal alignment.
  - Scheduling and reminder capabilities.

## Design Considerations
- **Visual Hierarchy:** Clear distinction between grid and list views with intuitive toggle.
- **Color Coding:** Each habit has a customizable color for easy identification.
- **Progress Visualization:** 7-day grid provides immediate visual feedback on consistency.
- **Interactive Elements:** Clickable completion buttons with immediate feedback.
- **Modal Design:** Comprehensive habit creation modal with step-by-step configuration.
- **Empty States:** Encouraging empty state when no habits exist.
- **Responsive Layout:** Adapts to different screen sizes and orientations.

## Special Notes
- The habits page is currently single-user and does not support user authentication.
- The habit creation modal (`habit_modal.js`) provides extensive configuration options with real-time validation.
- Completion tracking is handled via AJAX calls to avoid page refreshes.
- The 7-day completion grid shows the last 7 days including today.
- Streak calculation is done server-side for accuracy and consistency.
- The page emphasizes habit formation psychology through visual feedback and progress tracking.
- Goal linking allows habits to contribute to larger objectives.
- The modal includes advanced features like custom measurement units and flexible scheduling options.

---

# Goals Page Documentation

## Purpose
The Goals page is the central hub for users to define, track, and manage their long-term objectives. It enables users to break down big ambitions into actionable tasks and supporting habits, visualize progress, and stay motivated through clear feedback and analytics.

## Features & Functionality
- **Goals List:**
  - Displays all active goals as cards with icon, color, name, description, deadline, and progress bar.
  - Shows recently completed goals in a separate section.
  - Each goal card displays the number of linked tasks and supporting habits.
- **Goal Creation Modal:**
  - Two modes: Templates (predefined categories) and Custom (fully personalized goal creation).
  - Icon and color selection, name, description, category, and target completion date.
  - Option to add tasks and habits directly during goal creation.
  - "Why this matters" section to encourage reflection on motivation.
  - Live preview of the goal card as the user configures it.
- **Goal Detail View:**
  - Shows all details for a single goal: icon, color, name, description, deadline, creation date, and progress.
  - Progress analytics: overall percentage, tasks done, habit rate, and current streak.
  - Linked tasks: list with completion status, due dates, and descriptions.
  - Supporting habits: list with streaks and descriptions.
  - Journal notes: entries linked to the goal.
  - Edit, delete, archive, and complete actions for the goal.
- **Goal Editing:**
  - Edit all goal properties, including icon, color, name, description, category, and deadline.
- **Progress Tracking:**
  - Progress bar and percentage based on tasks and habit completion.
  - Streaks and habit rates for supporting habits.

## Desired Workflow
1. User navigates to the Goals page and sees a list of their active and recently completed goals.
2. User clicks the "+" button to create a new goal, choosing between a template or custom setup.
3. User configures the goal, optionally adding tasks and habits during creation.
4. User can view details of any goal, including progress, linked tasks, habits, and journal notes.
5. User can mark goals as completed, edit, archive, or delete them as needed.
6. User tracks progress through visual analytics and feedback.

## Business Logic
- **Data Management:** The backend (`routes/goals.py`) handles:
  - Fetching active and completed goals.
  - Creating, editing, archiving, and deleting goals.
  - Linking tasks, habits, and journal entries to goals.
  - Calculating progress based on tasks and habit completion rates.
- **Progress Calculation:**
  - Task progress: percentage of completed tasks.
  - Habit rate: average completion rate of supporting habits.
  - Overall progress: average of task progress and habit rate.
  - Streaks: maximum streak among supporting habits.
- **Goal Templates:**
  - Predefined categories and templates for common goal types (static for now).
- **Goal Completion:**
  - Marking a goal as completed sets its status and completion date.
  - Archived goals are hidden from the main list but not deleted.

## Design Considerations
- **Visual Hierarchy:** Card-based layout for goals, with clear separation between active and completed.
- **Color Coding:** Customizable color and icon for each goal for easy identification.
- **Progress Visualization:** Progress bars, percentages, and streaks provide immediate feedback.
- **Interactive Elements:** Clickable cards, add/edit/delete buttons, and modal dialogs for creation and editing.
- **Modal Design:** Goal creation modal with step-by-step configuration and live preview.
- **Empty States:** Encouraging empty state when no goals exist.
- **Responsive Layout:** Adapts to different screen sizes and orientations.

## Special Notes
- The goals page is currently single-user and does not support user authentication.
- The goal creation modal supports both template-based and custom goal creation.
- Progress analytics are calculated server-side for accuracy.
- Linked tasks and habits are managed through their respective pages but can be added during goal creation.
- The "Why this matters" section is designed to encourage deeper motivation and reflection.
- The page emphasizes breaking down big goals into actionable steps and tracking progress visually.

---

# Tasks Page Documentation

## Purpose
The Tasks page is the main interface for users to manage, organize, and track their daily and long-term tasks. It enables users to break down goals into actionable steps, prioritize work, and monitor progress through a flexible and interactive task management system.

## Features & Functionality
- **Task List:**
  - Displays all tasks as cards, with filters for all, today, and overdue tasks.
  - Each card shows task name, description, type, due date, goal link, and sub-tasks.
  - Checkbox to mark tasks as completed directly from the list.
  - Sub-tasks are displayed and can be checked off individually.
- **Task Creation Modal:**
  - Task type selection: Standard, To-Buy (shopping), Deadline.
  - Name, description, priority, due date/time, goal linking, tags, notes, reminders, and repeat options.
  - Quick date buttons for fast scheduling (today, tomorrow, this week, next week).
  - Sub-tasks/shopping list with dynamic add/remove.
  - Advanced options for tags, notes, reminders, and repeat settings.
  - Auto-save and validation for form fields.
- **Task Editing:**
  - Edit all task properties, including type, priority, due date, and goal link.
- **Task Completion:**
  - Mark tasks and sub-tasks as completed/uncompleted with instant feedback.
  - Completed tasks are visually distinguished.
- **Goal Linking:**
  - Tasks can be linked to goals for integrated progress tracking.
- **Task Filters:**
  - Filter tasks by all, today, and overdue for focused productivity.

## Desired Workflow
1. User navigates to the Tasks page and sees a list of all tasks, with filters for today and overdue.
2. User clicks the "+" button to create a new task, opening the comprehensive creation modal.
3. User configures the task with type, name, description, priority, due date/time, and optional goal link.
4. User can add sub-tasks or shopping items as needed.
5. User marks tasks and sub-tasks as completed as they work through their list.
6. User can edit, archive, or delete tasks as needed.
7. User tracks progress through visual feedback and filters.

## Business Logic
- **Data Management:** The backend (`routes/tasks.py`) handles:
  - Fetching all, today, and overdue tasks.
  - Creating, editing, archiving, and deleting tasks.
  - Managing sub-tasks and their completion status.
  - Linking tasks to goals for integrated progress.
- **Task Types:**
  - Standard: Regular tasks.
  - To-Buy: Shopping list items with quantity.
  - Deadline: Time-sensitive tasks with high priority and consequences.
- **Completion Logic:**
  - Marking a task or sub-task as completed updates its status and completion date.
  - Completed tasks are visually updated in the UI.
- **Goal Linking:**
  - Tasks can be linked to goals for progress tracking and analytics.
- **Filtering:**
  - Tasks are filtered by due date and status for focused views.

## Design Considerations
- **Visual Hierarchy:** Card-based layout for tasks, with clear separation by type and status.
- **Color Coding:** Customizable color and icon for each task for easy identification.
- **Progress Visualization:** Checkboxes, progress bars, and filters provide immediate feedback.
- **Interactive Elements:** Clickable cards, add/edit/delete buttons, and modal dialogs for creation and editing.
- **Modal Design:** Task creation modal with step-by-step configuration and auto-save.
- **Empty States:** Encouraging empty state when no tasks exist.
- **Responsive Layout:** Adapts to different screen sizes and orientations.

## Special Notes
- The tasks page is currently single-user and does not support user authentication.
- The task creation modal supports multiple task types and advanced options.
- Sub-tasks and shopping lists are managed dynamically in the modal.
- Completion tracking is handled via AJAX calls for instant feedback.
- Goal linking allows tasks to contribute to larger objectives.
- The page emphasizes breaking down work into actionable steps and tracking progress visually.

---

# Journal Page Documentation

## Purpose
The Journal page is the dedicated space for users to reflect, record thoughts, and track their emotional and productivity journey. It encourages daily writing, mood tracking, and linking reflections to goals, tasks, and habits for holistic self-improvement.

## Features & Functionality
- **Journal Entry List:**
  - Displays all journal entries in reverse chronological order.
  - Each entry shows date, time, title, content preview, mood, and links to goals, tasks, or habits.
  - Filter tabs for all, personal, goals, habits, and tasks.
- **Quick Reflection:**
  - Quick input box for fast journaling and mood selection.
  - Save button for instant entry creation.
- **Insights Card:**
  - Weekly stats: number of entries, day streak, and average mood.
  - Visual feedback for journaling consistency and mood trends.
- **Journal Entry Modal:**
  - Full-featured modal for creating new entries.
  - Fields for title, content, mood, tags, and links to goals, tasks, or habits.
  - Mood selection with emoji scale.
  - Tagging for organization and search.
  - Auto-save and validation for form fields.
- **Entry Editing & Deletion:**
  - Edit or delete any entry from the detail view or list.
- **Linking:**
  - Entries can be linked to specific goals, tasks, or habits for integrated reflection.

## Desired Workflow
1. User navigates to the Journal page and sees a list of all entries, with filter tabs for focused review.
2. User uses the quick reflection box for fast journaling and mood capture.
3. User clicks the "+" button to open the full journal entry modal for detailed writing.
4. User can link entries to goals, tasks, or habits for context.
5. User reviews weekly insights for consistency and mood trends.
6. User can edit or delete entries as needed.

## Business Logic
- **Data Management:** The backend (`routes/journal.py`) handles:
  - Fetching all journal entries and related data (goals, tasks, habits).
  - Creating, editing, and deleting entries.
  - Linking entries to goals, tasks, and habits.
  - Calculating weekly stats: entry count, streak, and average mood.
- **Mood Tracking:**
  - Mood is selected via emoji and stored as a rating.
  - Weekly average mood is calculated and displayed.
- **Entry Filtering:**
  - Entries can be filtered by type: all, personal, goals, habits, tasks.
- **Linking:**
  - Entries can be linked to one or more goals, tasks, or habits for integrated reflection.

## Design Considerations
- **Visual Hierarchy:** Card-based layout for entries, with clear separation by date and type.
- **Color Coding:** Mood and link chips provide visual cues.
- **Progress Visualization:** Insights card for weekly stats and trends.
- **Interactive Elements:** Quick reflection, add/edit/delete buttons, and modal dialogs for entry creation and editing.
- **Modal Design:** Journal entry modal with step-by-step configuration and auto-save.
- **Empty States:** Encouraging empty state when no entries exist.
- **Responsive Layout:** Adapts to different screen sizes and orientations.

## Special Notes
- The journal page is currently single-user and does not support user authentication.
- The quick reflection box is designed for fast, low-friction journaling.
- Mood tracking is integrated throughout the journaling experience.
- Linking entries to goals, tasks, and habits provides context and integrated reflection.
- Weekly insights encourage consistency and self-awareness.
- The page emphasizes the importance of regular reflection for personal growth.

---

# End of Page-by-Page Documentation
