# Project Kage - Habit Creation Modal: Complete Business Logic
**Purpose**: Comprehensive specification for habit creation with all required fields and validation logic

---

## 🎯 **CORE HABIT FIELDS (Your Current List + Missing Pieces)**

### **✅ FIELDS YOU IDENTIFIED (Correct!)**

#### **1. Name** (Required)
- **Type**: Text input
- **Validation**: 1-50 characters, no special characters except spaces and basic punctuation
- **Placeholder**: "What habit do you want to build?"
- **Business Logic**: Unique per user (warn if duplicate exists)

#### **2. Description** (Optional)
- **Type**: Textarea
- **Validation**: 0-200 characters
- **Placeholder**: "Why is this habit important to you?"
- **Business Logic**: Helps user clarify motivation and AI can use for insights

#### **3. Icon** (Required)
- **Type**: Icon/Emoji selector (HabitKit style)
- **Options**: 50+ categorized icons (Health, Productivity, Learning, etc.)
- **Default**: 🎯 (generic goal icon)
- **Business Logic**: Visual identification in grid and lists

#### **4. Color** (Required)
- **Type**: Color picker (8 gradient options)
- **Options**: Orange, Blue, Green, Purple, Pink, Yellow, Red, Teal
- **Default**: Orange (#FF7101 gradient)
- **Business Logic**: Grid visualization and category association

#### **5. Goal Linking** (Optional)
- **Type**: Dropdown with toggle
- **Options**: List of user's active goals + "Create New Goal"
- **Default**: Toggle ON, no goal selected
- **Business Logic**: Connects habit to goal progress calculation

#### **6. Frequency** (Required)
- **Type**: Selection with sub-options
- **Options**: 
  - Daily (default)
  - Weekly (select specific days: M,T,W,T,F,S,S)
  - Custom (X times per week/month)
- **Business Logic**: Determines streak calculation and grid display

#### **7. Measurement Type** (Required)
- **Type**: Radio selection
- **Options**:
  - **Simple Completion** (Yes/No daily) - Default
  - **Count-based** (Track number: reps, glasses, etc.)
  - **Time-based** (Track duration: minutes, hours)
  - **Custom Units** (Weight, distance, custom metric)
- **Business Logic**: Changes completion interface and progress tracking

---

## 🚀 **MISSING FIELDS YOU NEED TO ADD**

### **8. Target/Goal Amount** (Conditional - Required for Count/Time/Custom)
- **Type**: Number input + unit selector
- **Appears When**: Measurement type is not "Simple Completion"
- **Examples**: 
  - Count: "10 reps", "8 glasses"
  - Time: "30 minutes", "1 hour"
  - Custom: "2 miles", "150 lbs", "5 chapters"
- **Validation**: Positive numbers only, reasonable limits per type
- **Business Logic**: Determines completion threshold and progress visualization

### **9. Reminder Settings** (Optional)
- **Type**: Toggle + Time picker
- **Options**:
  - **Reminder On/Off** (Toggle)
  - **Reminder Time** (Time picker, default 9:00 AM)
  - **Reminder Days** (Inherits from frequency, but can customize)
- **Business Logic**: Schedules push notifications

### **10. Difficulty Level** (Optional)
- **Type**: 5-star or 1-5 number rating
- **Options**: Easy (1) → Very Hard (5)
- **Default**: 3 (Moderate)
- **Business Logic**: AI uses for habit suggestions and streak milestone celebrations

### **11. Start Date** (Optional)
- **Type**: Date picker
- **Default**: Today
- **Options**: Today, Tomorrow, Next Monday, Custom date
- **Business Logic**: Determines when tracking begins and affects streak calculations

### **12. Category/Tags** (Optional)
- **Type**: Dropdown or tag input
- **Options**: Predefined categories (Health, Productivity, Self-Care, Learning, etc.)
- **Default**: Auto-suggest based on habit name and icon
- **Business Logic**: Organization, filtering, and AI pattern recognition

### **13. Privacy Level** (Optional - Future Feature)
- **Type**: Radio selection
- **Options**: Private, Friends, Public
- **Default**: Private
- **Business Logic**: For social features and sharing achievements

---

## 📋 **COMPLETE MODAL STRUCTURE**

### **Section 1: Basic Information**
```
Name*               [Text Input]
Description         [Textarea - Optional]
```

### **Section 2: Visual Customization**
```
Icon*               [HabitKit-style icon grid]
Color*              [8 gradient color options]
```

### **Section 3: Tracking Configuration**
```
Measurement Type*   ○ Simple (Yes/No daily)
                   ○ Count (Track number)
                   ○ Time (Track duration)  
                   ○ Custom Units

Target Amount       [Number + Unit] (Shows when not Simple)
Frequency*          ○ Daily
                   ○ Weekly [M T W T F S S checkboxes]
                   ○ Custom [X times per week/month]
```

### **Section 4: Goal Integration**
```
Link to Goal?       [Toggle - Default ON]
Select Goal         [Dropdown] (Shows when toggle ON)
```

### **Section 5: Advanced Options** (Collapsible)
```
Start Date          [Date picker - Default Today]
Difficulty          [1-5 rating - Default 3]
Category            [Dropdown with auto-suggestions]
Reminder            [Toggle + Time picker]
```

---

## 🔄 **BUSINESS LOGIC FLOWS**

### **Measurement Type Logic**
```javascript
if (measurementType === 'simple') {
  // Show yes/no completion button
  // Grid shows filled/empty squares
  // Progress = completions / expected completions
} else if (measurementType === 'count') {
  // Show number input on completion
  // Grid shows partial fill based on target achievement
  // Progress = actual count / target count
} else if (measurementType === 'time') {
  // Show time input (duration picker)
  // Grid shows time-based progress fill
  // Progress = actual time / target time
} else if (measurementType === 'custom') {
  // Show number input + custom unit
  // Grid shows progress based on custom metric
  // Progress = actual amount / target amount
}
```

### **Frequency Logic**
```javascript
if (frequency === 'daily') {
  expectedCompletions = daysInPeriod;
} else if (frequency === 'weekly') {
  selectedDays = ['mon', 'wed', 'fri']; // user selection
  expectedCompletions = selectedDays.length * weeksInPeriod;
} else if (frequency === 'custom') {
  timesPerWeek = 3; // user input
  expectedCompletions = timesPerWeek * weeksInPeriod;
}
```

### **Streak Calculation Logic**
```javascript
function calculateStreak(completions, frequency) {
  // For daily habits: consecutive days with completion
  // For weekly habits: consecutive weeks with target met
  // For custom habits: consecutive periods with target met
  
  if (frequency === 'daily') {
    return consecutiveDaysWithCompletion(completions);
  } else {
    return consecutivePeriodsWithTargetMet(completions, frequency);
  }
}
```

### **Progress Visualization Logic**
```javascript
function getGridSquareState(completion, target, measurementType) {
  if (measurementType === 'simple') {
    return completion ? 'complete' : 'incomplete';
  } else {
    const percentage = completion / target;
    if (percentage >= 1.0) return 'complete';
    if (percentage >= 0.75) return 'mostly-complete';
    if (percentage >= 0.25) return 'partially-complete';
    return 'minimal';
  }
}
```

---

## ✅ **VALIDATION RULES**

### **Required Field Validation**
- **Name**: Must be 1-50 characters
- **Icon**: Must select one icon
- **Color**: Must select one color  
- **Measurement Type**: Must select one option
- **Frequency**: Must select one option
- **Target Amount**: Required when measurement type is not 'simple'

### **Business Logic Validation**
- **Name Uniqueness**: Warn if habit name already exists
- **Reasonable Targets**: Validate target amounts are realistic
  - Count: 1-1000 per day
  - Time: 1 minute - 24 hours per day
  - Custom: Depends on unit type
- **Frequency Logic**: Weekly selection must have at least 1 day selected
- **Date Logic**: Start date cannot be in the past (except today)

### **UX Validation**
- **Progressive Disclosure**: Show target amount only when relevant
- **Smart Defaults**: Auto-suggest category based on name/icon
- **Error Prevention**: Disable "Create" button until required fields valid
- **Clear Feedback**: Show validation errors inline, not in alerts

---

## 💡 **ADVANCED FEATURES (Phase 2)**

### **Smart Suggestions**
- **Auto-complete habit names** based on popular habits
- **Suggest icons** based on habit name (AI-powered)
- **Recommend targets** based on similar user habits
- **Suggest optimal timing** based on user's successful habits

### **Template System**
- **Popular habit templates** (like goal templates)
- **Pre-filled forms** with proven targets and settings
- **Category-based templates** (Morning Routine, Health, etc.)

### **AI Integration**
- **Difficulty assessment** based on habit complexity
- **Success probability** prediction based on user patterns
- **Optimal frequency** suggestions for better adherence

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **Phase 1 (MVP)**
1. Name, Description, Icon, Color (✅ You have this)
2. Goal Linking (✅ You have this)
3. Frequency (✅ You have this)
4. Measurement Type (✅ You have this)
5. **ADD: Target Amount** (Critical for non-simple habits)
6. **ADD: Start Date** (Important for streak calculation)

### **Phase 2 (Enhanced)**
7. Reminder Settings
8. Difficulty Level
9. Category/Tags
10. Advanced validation and smart suggestions

### **Phase 3 (Premium)**
11. AI-powered suggestions
12. Template system
13. Social features
14. Advanced analytics integration

---

## 🔥 **BOTTOM LINE**

**You've identified 90% of the critical fields!** The main missing pieces are:

1. **Target Amount** (CRITICAL - needed for count/time/custom tracking)
2. **Start Date** (IMPORTANT - affects streak calculations)
3. **Reminder Settings** (NICE TO HAVE - improves adherence)
4. **Difficulty Level** (NICE TO HAVE - helps AI features)

Your measurement type system is EXACTLY right - that's the key differentiator that makes Kage habits more flexible than most apps!

**This habit modal will be POWERFUL and comprehensive while staying intuitive!** 🚀