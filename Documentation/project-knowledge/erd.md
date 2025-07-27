# Kage Life Companion: Data Model & Development Prompt for Cursor

## Purpose

This document defines the complete data model for the Kage Life Companion app. Use it to guide Cursor AI in generating models, forms, and database logic for all main features: Goals, Tasks, Habits, Journal Entries, and Calendar Blocks.

## Instructions for Cursor AI

- **Read the entire data model and relationships below.**
- **For each entity, generate:**
  - Data model/class with all fields and types
  - Form UI for creation and editing (using required/optional and validation info)
  - Database schema or storage logic
- **Respect all relationships** (e.g., linking tasks to goals, habits to goals, etc.)
- **Use enums and validation as described.**
- **When generating forms, show/hide fields based on logic (e.g., custom tracking for habits).**
- **Allow linking/unlinking between entities as specified.**

## Entities and Fields

### Goal

| Field Name         | Type                      | Required | Notes/Validation                                |
|--------------------|--------------------------|----------|-------------------------------------------------|
| id                 | UUID                     | Yes      | Unique identifier                               |
| name               | String                   | Yes      | Max 60 chars                                    |
| description        | String                   | No       | Max 300 chars                                   |
| icon               | String                   | Yes      | Emoji or icon reference                         |
| color              | String                   | Yes      | Hex or gradient                                 |
| category           | String                   | Yes      | E.g., Health, Career, etc.                      |
| tags               | Array[String]            | No       | User-created tags                               |
| motivation         | String                   | No       | Why this goal matters                           |
| target_date        | Date                     | No       |                                                 |
| estimated_duration | String                   | No       | E.g., "3 months"                                |
| linked_tasks       | Array[UUID]              | No       | Linked tasks                                    |
| linked_habits      | Array[UUID]              | No       | Linked habits                                   |
| achievements       | Array[Achievement]       | No       | Earned achievements                             |
| from_template      | Boolean                  | No       | Was this goal created from a template?          |
| template_id        | UUID                     | No       | If from template, reference ID                  |

### Task

| Field Name      | Type                  | Required | Notes/Validation                                |
|-----------------|----------------------|----------|-------------------------------------------------|
| id              | UUID                 | Yes      | Unique identifier                               |
| type            | Enum                 | Yes      | standard, to-buy, deadline                      |
| name            | String               | Yes      |                                                 |
| description     | String               | No       |                                                 |
| priority        | Enum                 | Yes      | urgent, high, medium, low, none                 |
| due_date        | DateTime             | No       |                                                 |
| goal_id         | UUID                 | No       | Optional link to goal                           |
| sub_tasks       | Array[SubTask]       | No       | For standard/deadline tasks                     |
| shopping_list   | Array[ShoppingListItem]| No     | For to-buy tasks                                |
| consequence     | String               | No       | For deadline tasks only                         |
| category        | String               | No       | For deadline tasks only                         |
| tags            | Array[String]        | No       |                                                 |
| notes           | String               | No       |                                                 |
| reminder        | String               | No       |                                                 |
| repeat          | String               | No       |                                                 |
| status          | Enum                 | Yes      | active, completed, archived                     |

### SubTask

| Field Name  | Type    | Required | Notes/Validation        |
|-------------|---------|----------|-------------------------|
| id          | UUID    | Yes      | Unique identifier       |
| task_id     | UUID    | Yes      | Parent task             |
| name        | String  | Yes      |                         |
| completed   | Boolean | Yes      |                         |

### ShoppingListItem

| Field Name  | Type    | Required | Notes/Validation        |
|-------------|---------|----------|-------------------------|
| id          | UUID    | Yes      | Unique identifier       |
| task_id     | UUID    | Yes      | Parent task             |
| item_name   | String  | Yes      |                         |
| quantity    | String  | No       |                         |
| purchased   | Boolean | No       |                         |

### Habit

| Field Name            | Type                  | Required | Notes/Validation                                |
|-----------------------|----------------------|----------|-------------------------------------------------|
| id                    | UUID                 | Yes      | Unique identifier                               |
| icon                  | String               | Yes      | Emoji or icon reference                         |
| name                  | String               | Yes      |                                                 |
| description           | String               | No       |                                                 |
| color                 | String               | Yes      |                                                 |
| goal_id               | UUID                 | No       | Optional link to goal                           |
| start_date            | Date                 | Yes      |                                                 |
| time                  | Time                 | No       |                                                 |
| reminder              | String               | No       |                                                 |
| calendar_integration  | Boolean              | No       |                                                 |
| frequency_type        | Enum                 | Yes      | daily, weekly, custom                           |
| frequency_days        | Array[String]        | No       | For weekly frequency                            |
| custom_frequency      | Int                  | No       | For custom frequency                            |
| custom_period         | Enum                 | No       | day, week, month                                |
| tracking_type         | Enum                 | Yes      | simple, custom                                  |
| target_amount         | Int                  | No       | For custom tracking                             |
| measurement_type      | String               | No       | E.g., times, minutes, custom                    |
| created_at            | DateTime             | Yes      |                                                 |

### JournalEntry

| Field Name   | Type    | Required | Notes/Validation                                |
|--------------|---------|----------|-------------------------------------------------|
| id           | UUID    | Yes      | Unique identifier                               |
| content      | String  | Yes      | Journal text                                    |
| mood         | Enum    | Yes      | very_low, low, neutral, good, great             |
| entry_type   | Enum    | Yes      | goal, task, habit, personal                     |
| linked_id    | UUID    | No       | ID of linked goal/task/habit, null if personal  |
| created_at   | DateTime| Yes      |                                                 |

### CalendarBlock

| Field Name      | Type    | Required | Notes/Validation                                |
|-----------------|---------|----------|-------------------------------------------------|
| id              | UUID    | Yes      | Unique identifier                               |
| title           | String  | Yes      |                                                 |
| description     | String  | No       |                                                 |
| icon            | String  | Yes      |                                                 |
| color           | String  | Yes      |                                                 |
| date            | Date    | Yes      |                                                 |
| time            | Time    | Yes      | Start time                                      |
| duration        | Int     | Yes      | In minutes                                      |
| linked_type     | Enum    | No       | goal, task, habit, none                         |
| linked_id       | UUID    | No       | ID of linked item                               |
| reminder        | String  | No       |                                                 |
| created_at      | DateTime| Yes      |                                                 |

## Relationships

- **Goal** (1) — (M) **Task** (via `goal_id`)
- **Goal** (1) — (M) **Habit** (via `goal_id`)
- **Goal** (1) — (M) **JournalEntry** (via `linked_id` where `entry_type` is "goal")
- **Goal** (1) — (M) **CalendarBlock** (via `linked_id` where `linked_type` is "goal")
- **Task** (1) — (M) **SubTask** (via `task_id`)
- **Task** (1) — (M) **ShoppingListItem** (via `task_id`)

## Special Logic

- **JournalEntry:** If no goal/task/habit is linked, set `entry_type` to "personal" and `linked_id` to null.
- **Habit:** Show/hide custom tracking fields based on `tracking_type`.
- **Task:** Show shopping list for "to-buy" tasks, sub-tasks for other types.
- **CalendarBlock:** Allow linking to goal, task, or habit, or leave unlinked.

## Next Steps

1. Use this document as the single source of truth for all data models and forms.
2. For each entity, generate:
   - Data model/class
   - Form with validation
   - Database/storage logic
3. Implement relationships and linking as described.
4. Ask for clarification or modifications as needed before proceeding to advanced features.

**This document is designed to be copy-pasted directly into Cursor as a prompt or support file.**  
If you need to update or expand the model, add new fields or relationships in the same format.