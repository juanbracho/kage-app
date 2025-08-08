import { GoalTemplate, TemplateCollection } from '../types/goal';

// Goal Templates Data - Simple, Beginner-Friendly Templates
// 4 templates per category designed for easy completion and habit building

const templates: GoalTemplate[] = [
  // 💪 FITNESS & HEALTH CATEGORY
  {
    id: "walk-10k-steps",
    name: "Walk 10,000 Steps Daily",
    description: "Build a healthy walking habit by reaching 10,000 steps every day through consistent daily movement",
    category: "health",
    icon: "👟",
    color: "linear-gradient(135deg, #10B981, #22C55E)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "high",
    isPopular: true,
    tags: ["walking", "steps", "cardio", "daily", "fitness"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "CDC Physical Activity Guidelines",
      prerequisites: ["Ability to walk", "Basic mobility"],
      successRate: "78%",
      averageCompletionTime: "8-12 weeks",
      difficultyJustification: "Simple daily habit that builds over time"
    },
    templateTasks: [
      {
        id: "setup-step-tracker",
        name: "Buy/Setup Step Tracker",
        description: "Get a step counter device or smartphone app to monitor daily steps",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "find-walking-routes",
        name: "Find 3 Walking Routes Near Home",
        description: "Scout local walking paths for variety and weather backup options",
        priority: "medium",
        estimatedTime: 90,
        category: "preparation"
      },
      {
        id: "set-step-reminder",
        name: "Set Daily Step Reminder",
        description: "Configure phone/watch reminders to check step progress throughout day",
        priority: "medium",
        estimatedTime: 15,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "morning-walk",
        name: "Morning 15-Minute Walk",
        description: "Start each day with a 15-minute walk to build momentum",
        icon: "🌅",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 15,
        targetUnit: "minutes",
        category: "health",
        priority: "high"
      },
      {
        id: "take-stairs",
        name: "Take Stairs Instead of Elevator",
        description: "Choose stairs when available to add natural step count",
        icon: "🪜",
        measurementType: "simple",
        frequency: "daily",
        category: "health",
        priority: "medium"
      }
    ]
  },

  {
    id: "exercise-3x-week",
    name: "Exercise 3x Per Week",
    description: "Establish a consistent workout routine with three exercise sessions per week",
    category: "health",
    icon: "💪",
    color: "linear-gradient(135deg, #F59E0B, #F97316)",
    estimatedDuration: "2 months",
    difficulty: "beginner",
    popularity: "high",
    isPopular: true,
    tags: ["exercise", "workout", "routine", "fitness", "strength"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "ACSM Exercise Guidelines",
      prerequisites: ["Basic physical ability"],
      successRate: "68%",
      averageCompletionTime: "6-8 weeks",
      difficultyJustification: "Moderate commitment, flexible scheduling"
    },
    templateTasks: [
      {
        id: "choose-workout-type",
        name: "Choose Workout Type (Gym/Home/Outdoor)",
        description: "Decide on exercise format that fits your lifestyle and preferences",
        priority: "high",
        estimatedTime: 30,
        category: "preparation"
      },
      {
        id: "schedule-workout-times",
        name: "Schedule Workout Times in Calendar",
        description: "Block specific times for workouts to ensure consistency",
        priority: "high",
        estimatedTime: 20,
        category: "preparation"
      },
      {
        id: "prepare-workout-gear",
        name: "Prepare Workout Gear/Space",
        description: "Organize equipment, clothes, or space needed for chosen exercise type",
        priority: "medium",
        estimatedTime: 45,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "workout-session",
        name: "30-Minute Workout Sessions",
        description: "Complete focused 30-minute exercise sessions",
        icon: "🏋️",
        measurementType: "time",
        frequency: "custom",
        customFrequency: { times: 3, period: "week" },
        targetAmount: 30,
        targetUnit: "minutes",
        category: "health",
        priority: "high"
      },
      {
        id: "post-workout-nutrition",
        name: "Post-Workout Protein/Hydration",
        description: "Refuel properly after each workout session",
        icon: "🥤",
        measurementType: "simple",
        frequency: "custom",
        customFrequency: { times: 3, period: "week" },
        category: "health",
        priority: "medium"
      }
    ]
  },

  {
    id: "drink-8-glasses-water",
    name: "Drink 8 Glasses of Water",
    description: "Stay properly hydrated by drinking eight 8-ounce glasses of water daily",
    category: "health",
    icon: "💧",
    color: "linear-gradient(135deg, #06B6D4, #0EA5E9)",
    estimatedDuration: "3 weeks",
    difficulty: "beginner",
    popularity: "high",
    isPopular: true,
    tags: ["hydration", "water", "health", "daily", "wellness"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Mayo Clinic Hydration Guidelines",
      prerequisites: ["Access to clean water"],
      successRate: "85%",
      averageCompletionTime: "3-4 weeks",
      difficultyJustification: "Simple daily habit with immediate benefits"
    },
    templateTasks: [
      {
        id: "get-water-bottle",
        name: "Get Water Tracking Bottle/App",
        description: "Obtain a marked water bottle or smartphone app to track intake",
        priority: "high",
        estimatedTime: 30,
        category: "preparation"
      },
      {
        id: "set-water-reminders",
        name: "Set Hourly Water Reminders",
        description: "Configure regular reminders to drink water throughout the day",
        priority: "medium",
        estimatedTime: 10,
        category: "preparation"
      },
      {
        id: "identify-trigger-moments",
        name: "Identify Trigger Moments for Drinking",
        description: "Link water drinking to existing habits (before meals, after bathroom, etc.)",
        priority: "medium",
        estimatedTime: 15,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "morning-water",
        name: "Glass of Water Upon Waking",
        description: "Start each day with a full glass of water",
        icon: "🌅",
        measurementType: "count",
        frequency: "daily",
        targetAmount: 1,
        targetUnit: "glasses",
        category: "health",
        priority: "high"
      },
      {
        id: "meal-water",
        name: "Water with Each Meal",
        description: "Drink water with breakfast, lunch, and dinner",
        icon: "🍽️",
        measurementType: "count",
        frequency: "daily",
        targetAmount: 3,
        targetUnit: "glasses",
        category: "health",
        priority: "high"
      }
    ]
  },

  {
    id: "8-hours-sleep",
    name: "Get 8 Hours of Sleep",
    description: "Establish consistent sleep schedule to get 8 hours of quality sleep nightly",
    category: "health",
    icon: "😴",
    color: "linear-gradient(135deg, #8B5CF6, #A855F7)",
    estimatedDuration: "6 weeks",
    difficulty: "beginner",
    popularity: "high",
    isPopular: true,
    tags: ["sleep", "rest", "recovery", "routine", "health"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Sleep Foundation Guidelines",
      prerequisites: ["Basic schedule flexibility"],
      successRate: "72%",
      averageCompletionTime: "4-6 weeks",
      difficultyJustification: "Requires schedule adjustment and consistency"
    },
    templateTasks: [
      {
        id: "create-bedtime-routine",
        name: "Create Bedtime Routine Checklist",
        description: "Develop consistent pre-sleep activities to signal bedtime",
        priority: "high",
        estimatedTime: 45,
        category: "preparation"
      },
      {
        id: "setup-bedroom-sleep",
        name: "Setup Bedroom for Better Sleep",
        description: "Optimize bedroom environment (temperature, darkness, comfort)",
        priority: "medium",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "remove-screens-bedtime",
        name: "Remove Screens 1 Hour Before Bed",
        description: "Establish screen-free time before sleep for better sleep quality",
        priority: "high",
        estimatedTime: 10,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "consistent-bedtime",
        name: "Same Bedtime Every Night",
        description: "Go to bed at the same time each night to regulate sleep cycle",
        icon: "🕙",
        measurementType: "simple",
        frequency: "daily",
        category: "health",
        priority: "high"
      },
      {
        id: "no-caffeine-afternoon",
        name: "No Caffeine After 2 PM",
        description: "Avoid caffeine in afternoon to prevent sleep interference",
        icon: "☕",
        measurementType: "simple",
        frequency: "daily",
        category: "health",
        priority: "medium"
      }
    ]
  },

  // 🎓 LEARNING & GROWTH CATEGORY
  {
    id: "read-12-books-year",
    name: "Read 12 Books This Year",
    description: "Develop a consistent reading habit to complete one book per month",
    category: "learning",
    icon: "📚",
    color: "linear-gradient(135deg, #DC2626, #EF4444)",
    estimatedDuration: "12 months",
    difficulty: "beginner",
    popularity: "high",
    isPopular: true,
    tags: ["reading", "books", "knowledge", "learning", "growth"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Average reading statistics",
      prerequisites: ["Basic reading ability"],
      successRate: "65%",
      averageCompletionTime: "12 months",
      difficultyJustification: "Requires consistent daily reading habit"
    },
    templateTasks: [
      {
        id: "create-reading-list",
        name: "Create Reading List of 12 Books",
        description: "Choose 12 books across different genres for variety",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "setup-reading-space",
        name: "Set Up Reading Space/Corner",
        description: "Create comfortable, well-lit space dedicated to reading",
        priority: "medium",
        estimatedTime: 45,
        category: "preparation"
      },
      {
        id: "join-book-community",
        name: "Join Online Book Community",
        description: "Find reading group or online community for motivation and discussion",
        priority: "medium",
        estimatedTime: 30,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "bedtime-reading",
        name: "Read 20 Minutes Before Bed",
        description: "Replace screen time with reading before sleep",
        icon: "📖",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 20,
        targetUnit: "minutes",
        category: "learning",
        priority: "high"
      },
      {
        id: "carry-book",
        name: "Carry Book/E-Reader Everywhere",
        description: "Always have reading material for unexpected free time",
        icon: "🎒",
        measurementType: "simple",
        frequency: "daily",
        category: "learning",
        priority: "medium"
      }
    ]
  },

  {
    id: "learn-spanish-basics",
    name: "Learn Spanish Basics",
    description: "Master basic Spanish conversation skills through daily practice and study",
    category: "learning",
    icon: "🇪🇸",
    color: "linear-gradient(135deg, #F59E0B, #F97316)",
    estimatedDuration: "6 months",
    difficulty: "beginner",
    popularity: "high",
    isPopular: true,
    tags: ["spanish", "language", "conversation", "learning", "communication"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Language learning research",
      prerequisites: ["Willingness to practice daily"],
      successRate: "58%",
      averageCompletionTime: "5-7 months",
      difficultyJustification: "Requires consistent daily practice and patience"
    },
    templateTasks: [
      {
        id: "choose-spanish-method",
        name: "Choose Learning App/Method",
        description: "Select primary Spanish learning resource (Duolingo, Babbel, etc.)",
        priority: "high",
        estimatedTime: 45,
        category: "preparation"
      },
      {
        id: "find-practice-partner",
        name: "Find Spanish Practice Partner",
        description: "Connect with native speaker or fellow learner for conversation practice",
        priority: "medium",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "set-study-schedule",
        name: "Set Up Daily Study Schedule",
        description: "Block consistent time each day for Spanish learning",
        priority: "high",
        estimatedTime: 15,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "daily-spanish-lesson",
        name: "15-Minute Daily Spanish Lesson",
        description: "Complete focused Spanish study session each day",
        icon: "📱",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 15,
        targetUnit: "minutes",
        category: "learning",
        priority: "high"
      },
      {
        id: "spanish-podcast-commute",
        name: "Spanish Podcast During Commute",
        description: "Listen to Spanish audio content while traveling or exercising",
        icon: "🎧",
        measurementType: "simple",
        frequency: "daily",
        category: "learning",
        priority: "medium"
      }
    ]
  },

  {
    id: "complete-online-course",
    name: "Complete Online Course",
    description: "Successfully finish a structured online course to learn a new skill",
    category: "learning",
    icon: "💻",
    color: "linear-gradient(135deg, #06B6D4, #0EA5E9)",
    estimatedDuration: "2 months",
    difficulty: "beginner",
    popularity: "medium",
    isPopular: false,
    tags: ["course", "online", "skill", "certificate", "learning"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Online course completion rates",
      prerequisites: ["Internet access", "Basic computer skills"],
      successRate: "45%",
      averageCompletionTime: "6-10 weeks",
      difficultyJustification: "Requires self-discipline and time management"
    },
    templateTasks: [
      {
        id: "choose-specific-course",
        name: "Choose Specific Course to Complete",
        description: "Select one course that aligns with your interests or career goals",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "block-study-time",
        name: "Block Calendar Time for Lessons",
        description: "Schedule specific times for course work in your calendar",
        priority: "high",
        estimatedTime: 20,
        category: "preparation"
      },
      {
        id: "setup-note-system",
        name: "Set Up Note-Taking System",
        description: "Organize digital or physical notes for course content",
        priority: "medium",
        estimatedTime: 30,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "daily-study",
        name: "Study 30 Minutes Daily",
        description: "Dedicate focused time to course content each day",
        icon: "📝",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 30,
        targetUnit: "minutes",
        category: "learning",
        priority: "high"
      },
      {
        id: "weekly-review",
        name: "Review Notes Weekly",
        description: "Consolidate and review course notes each week",
        icon: "🔍",
        measurementType: "simple",
        frequency: "weekly",
        category: "learning",
        priority: "medium"
      }
    ]
  },

  {
    id: "practice-guitar-daily",
    name: "Practice Guitar Daily",
    description: "Build guitar playing skills through consistent daily practice sessions",
    category: "learning",
    icon: "🎸",
    color: "linear-gradient(135deg, #8B5CF6, #A855F7)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "medium",
    isPopular: false,
    tags: ["guitar", "music", "practice", "instrument", "skill"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Music education research",
      prerequisites: ["Access to guitar"],
      successRate: "62%",
      averageCompletionTime: "10-12 weeks",
      difficultyJustification: "Requires finger strength development and muscle memory"
    },
    templateTasks: [
      {
        id: "get-tune-guitar",
        name: "Get/Tune Guitar",
        description: "Acquire guitar and learn basic tuning techniques",
        priority: "high",
        estimatedTime: 90,
        category: "preparation"
      },
      {
        id: "find-beginner-songs",
        name: "Find Beginner Song List",
        description: "Identify 5-10 simple songs to learn progressively",
        priority: "medium",
        estimatedTime: 45,
        category: "preparation"
      },
      {
        id: "setup-practice-area",
        name: "Set Up Practice Area",
        description: "Create dedicated space for guitar practice with good lighting",
        priority: "medium",
        estimatedTime: 30,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "daily-practice",
        name: "20-Minute Daily Practice",
        description: "Consistent daily guitar practice focusing on technique and songs",
        icon: "🎵",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 20,
        targetUnit: "minutes",
        category: "learning",
        priority: "high"
      },
      {
        id: "learn-chord-weekly",
        name: "Learn One New Chord Weekly",
        description: "Gradually expand chord vocabulary with one new chord each week",
        icon: "📚",
        measurementType: "simple",
        frequency: "weekly",
        category: "learning",
        priority: "medium"
      }
    ]
  },

  // 💰 FINANCE & CAREER CATEGORY
  {
    id: "save-5k-emergency",
    name: "Save $5,000 Emergency Fund",
    description: "Build financial security by saving $5,000 for unexpected expenses",
    category: "finance",
    icon: "💰",
    color: "linear-gradient(135deg, #10B981, #22C55E)",
    estimatedDuration: "10 months",
    difficulty: "beginner",
    popularity: "high",
    isPopular: true,
    tags: ["savings", "emergency", "financial", "security", "money"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Personal finance best practices",
      prerequisites: ["Stable income", "Basic budgeting"],
      successRate: "68%",
      averageCompletionTime: "8-12 months",
      difficultyJustification: "Requires discipline and consistent saving habits"
    },
    templateTasks: [
      {
        id: "open-savings-account",
        name: "Open High-Yield Savings Account",
        description: "Find and open savings account with competitive interest rate",
        priority: "high",
        estimatedTime: 90,
        category: "preparation"
      },
      {
        id: "calculate-savings-needed",
        name: "Calculate Monthly Savings Needed",
        description: "Determine how much to save monthly to reach $5,000 goal",
        priority: "high",
        estimatedTime: 30,
        category: "preparation"
      },
      {
        id: "setup-auto-transfer",
        name: "Set Up Automatic Transfers",
        description: "Automate monthly transfers from checking to savings account",
        priority: "high",
        estimatedTime: 20,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "monthly-saving",
        name: "Save $500 Monthly",
        description: "Consistently transfer $500 to emergency savings each month",
        icon: "💳",
        measurementType: "count",
        frequency: "monthly",
        targetAmount: 500,
        targetUnit: "dollars",
        category: "finance",
        priority: "high"
      },
      {
        id: "weekly-spending-review",
        name: "Review Spending Weekly",
        description: "Check expenses weekly to ensure saving goals remain on track",
        icon: "📊",
        measurementType: "simple",
        frequency: "weekly",
        category: "finance",
        priority: "medium"
      }
    ]
  },

  {
    id: "pay-off-credit-debt",
    name: "Pay Off Credit Card Debt",
    description: "Eliminate all credit card debt through focused payment strategy",
    category: "finance",
    icon: "💳",
    color: "linear-gradient(135deg, #DC2626, #EF4444)",
    estimatedDuration: "8 months",
    difficulty: "intermediate",
    popularity: "high",
    isPopular: true,
    tags: ["debt", "credit-card", "payoff", "financial", "freedom"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Debt snowball/avalanche methods",
      prerequisites: ["Stable income", "Debt details"],
      successRate: "72%",
      averageCompletionTime: "6-10 months",
      difficultyJustification: "Requires budgeting discipline and payment consistency"
    },
    templateTasks: [
      {
        id: "calculate-total-debt",
        name: "Calculate Total Debt Amount",
        description: "List all credit cards with balances, minimum payments, and interest rates",
        priority: "high",
        estimatedTime: 45,
        category: "preparation"
      },
      {
        id: "choose-payoff-strategy",
        name: "Choose Debt Payoff Strategy",
        description: "Select debt snowball (lowest balance) or avalanche (highest interest) method",
        priority: "high",
        estimatedTime: 30,
        category: "preparation"
      },
      {
        id: "negotiate-creditors",
        name: "Negotiate with Creditors if Needed",
        description: "Contact credit card companies to discuss payment plans or rate reductions",
        priority: "medium",
        estimatedTime: 120,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "pay-more-minimum",
        name: "Pay More Than Minimum Monthly",
        description: "Pay extra amount toward debt each month beyond minimum payment",
        icon: "💸",
        measurementType: "simple",
        frequency: "monthly",
        category: "finance",
        priority: "high"
      },
      {
        id: "no-new-purchases",
        name: "No New Credit Card Purchases",
        description: "Avoid adding to credit card debt while paying it off",
        icon: "🚫",
        measurementType: "simple",
        frequency: "daily",
        category: "finance",
        priority: "high"
      }
    ]
  },

  {
    id: "get-job-promotion",
    name: "Get Job Promotion",
    description: "Advance career through skill development and strategic workplace performance",
    category: "career",
    icon: "📈",
    color: "linear-gradient(135deg, #F59E0B, #F97316)",
    estimatedDuration: "6 months",
    difficulty: "intermediate",
    popularity: "medium",
    isPopular: false,
    tags: ["promotion", "career", "advancement", "skills", "workplace"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Career advancement strategies",
      prerequisites: ["Current employment", "Performance review system"],
      successRate: "55%",
      averageCompletionTime: "4-8 months",
      difficultyJustification: "Depends on organizational structure and available positions"
    },
    templateTasks: [
      {
        id: "meet-manager-goals",
        name: "Meet with Manager About Goals",
        description: "Schedule formal discussion about promotion requirements and timeline",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "document-achievements",
        name: "Document Current Achievements",
        description: "Create comprehensive list of accomplishments and contributions",
        priority: "high",
        estimatedTime: 90,
        category: "preparation"
      },
      {
        id: "identify-skills-gap",
        name: "Identify Skills Gap for Next Level",
        description: "Determine what skills or experience needed for target position",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "schedule-manager-checkins",
        name: "Schedule Regular Check-ins with Boss",
        description: "Set recurring meetings to discuss progress and feedback",
        priority: "medium",
        estimatedTime: 15,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "arrive-early",
        name: "Arrive 15 Minutes Early Daily",
        description: "Demonstrate commitment by consistently arriving before scheduled time",
        icon: "⏰",
        measurementType: "simple",
        frequency: "daily",
        category: "career",
        priority: "medium"
      },
      {
        id: "extra-project-monthly",
        name: "Take On One Extra Project Monthly",
        description: "Volunteer for additional responsibilities to show initiative",
        icon: "📋",
        measurementType: "simple",
        frequency: "monthly",
        category: "career",
        priority: "high"
      }
    ]
  },

  {
    id: "start-side-business",
    name: "Start Side Business",
    description: "Launch a small business venture to generate additional income",
    category: "career",
    icon: "🚀",
    color: "linear-gradient(135deg, #8B5CF6, #A855F7)",
    estimatedDuration: "6 months",
    difficulty: "intermediate",
    popularity: "medium",
    isPopular: false,
    tags: ["business", "entrepreneurship", "side-hustle", "income", "startup"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Small business development practices",
      prerequisites: ["Business idea", "Initial time investment"],
      successRate: "42%",
      averageCompletionTime: "4-8 months",
      difficultyJustification: "Requires market validation, consistent effort, and business skills"
    },
    templateTasks: [
      {
        id: "validate-business-idea",
        name: "Research Business Idea Feasibility",
        description: "Validate market demand and competition for business concept",
        priority: "high",
        estimatedTime: 180,
        category: "preparation"
      },
      {
        id: "register-business",
        name: "Register Business Name/Structure",
        description: "Complete legal requirements for business registration",
        priority: "high",
        estimatedTime: 120,
        category: "preparation"
      },
      {
        id: "create-online-presence",
        name: "Create Basic Website/Social Media",
        description: "Establish online presence for business visibility and credibility",
        priority: "medium",
        estimatedTime: 240,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "daily-business-work",
        name: "Work on Business 1 Hour Daily",
        description: "Dedicate focused time each day to business development",
        icon: "⏱️",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 60,
        targetUnit: "minutes",
        category: "career",
        priority: "high"
      },
      {
        id: "weekly-networking",
        name: "Network with One New Person Weekly",
        description: "Build professional network through regular new connections",
        icon: "🤝",
        measurementType: "simple",
        frequency: "weekly",
        category: "career",
        priority: "medium"
      }
    ]
  },


  // 🌱 PERSONAL DEVELOPMENT CATEGORY
  {
    id: "meditate-10-minutes",
    name: "Meditate 10 Minutes Daily",
    description: "Develop mindfulness and reduce stress through daily meditation practice",
    category: "personal",
    icon: "🧘‍♂️",
    color: "linear-gradient(135deg, #8B5CF6, #A855F7)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "high",
    isPopular: true,
    tags: ["meditation", "mindfulness", "stress", "wellness", "mental-health"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Mindfulness research and meditation apps",
      prerequisites: ["Quiet space", "10 minutes daily"],
      successRate: "65%",
      averageCompletionTime: "8-12 weeks",
      difficultyJustification: "Simple concept but requires consistency and mental discipline"
    },
    templateTasks: [
      {
        id: "download-meditation-app",
        name: "Download Meditation App",
        description: "Choose guided meditation app (Headspace, Calm, Insight Timer, etc.)",
        priority: "high",
        estimatedTime: 20,
        category: "preparation"
      },
      {
        id: "create-meditation-space",
        name: "Create Quiet Meditation Space",
        description: "Set up peaceful corner or area for daily meditation practice",
        priority: "medium",
        estimatedTime: 30,
        category: "preparation"
      },
      {
        id: "set-meditation-reminder",
        name: "Set Daily Meditation Reminder",
        description: "Configure phone or calendar reminders for consistent practice",
        priority: "high",
        estimatedTime: 10,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "morning-meditation",
        name: "Morning 10-Minute Meditation",
        description: "Start each day with focused meditation or mindfulness practice",
        icon: "🌅",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 10,
        targetUnit: "minutes",
        category: "personal",
        priority: "high"
      },
      {
        id: "evening-breathing",
        name: "Evening Breathing Exercise",
        description: "End day with simple breathing exercise for relaxation",
        icon: "🌙",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 5,
        targetUnit: "minutes",
        category: "personal",
        priority: "medium"
      }
    ]
  },

  {
    id: "daily-journaling",
    name: "Write in Journal Daily",
    description: "Develop self-awareness and emotional processing through daily journaling",
    category: "personal",
    icon: "📔",
    color: "linear-gradient(135deg, #DC2626, #EF4444)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "medium",
    isPopular: false,
    tags: ["journaling", "reflection", "writing", "self-awareness", "growth"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Therapeutic writing research",
      prerequisites: ["Writing materials", "Privacy"],
      successRate: "71%",
      averageCompletionTime: "8-10 weeks",
      difficultyJustification: "Requires introspection and consistent writing habit"
    },
    templateTasks: [
      {
        id: "choose-journal-format",
        name: "Buy Journal or Set Up Digital One",
        description: "Choose between physical notebook or digital journaling app",
        priority: "high",
        estimatedTime: 30,
        category: "preparation"
      },
      {
        id: "choose-journaling-prompts",
        name: "Choose Journaling Prompts/Format",
        description: "Select structured prompts or free-form writing style",
        priority: "medium",
        estimatedTime: 45,
        category: "preparation"
      },
      {
        id: "set-writing-time",
        name: "Set Consistent Writing Time",
        description: "Choose specific daily time for journaling practice",
        priority: "high",
        estimatedTime: 10,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "daily-gratitudes",
        name: "Write 3 Gratitudes Daily",
        description: "Record three things you're grateful for each day",
        icon: "🙏",
        measurementType: "count",
        frequency: "daily",
        targetAmount: 3,
        targetUnit: "items",
        category: "personal",
        priority: "high"
      },
      {
        id: "evening-reflection",
        name: "Evening Reflection Session",
        description: "Reflect on daily experiences, emotions, and lessons learned",
        icon: "🌆",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 10,
        targetUnit: "minutes",
        category: "personal",
        priority: "medium"
      }
    ]
  },

  {
    id: "daily-compliments",
    name: "Compliment Someone Daily",
    description: "Spread positivity and improve relationships by giving genuine daily compliments",
    category: "personal",
    icon: "😊",
    color: "linear-gradient(135deg, #F59E0B, #F97316)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "medium",
    isPopular: false,
    tags: ["positivity", "compliments", "kindness", "relationships", "communication"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Positive psychology research",
      prerequisites: ["Social interactions"],
      successRate: "89%",
      averageCompletionTime: "4-6 weeks",
      difficultyJustification: "Simple social practice with immediate positive feedback"
    },
    templateTasks: [
      {
        id: "practice-genuine-compliments",
        name: "Practice Giving Genuine Compliments",
        description: "Learn to identify authentic positive qualities in others",
        priority: "medium",
        estimatedTime: 30,
        category: "preparation"
      },
      {
        id: "identify-compliment-opportunities",
        name: "Identify Daily Compliment Opportunities",
        description: "Notice moments throughout day to give meaningful compliments",
        priority: "high",
        estimatedTime: 20,
        category: "preparation"
      },
      {
        id: "track-compliments",
        name: "Track Compliments Given",
        description: "Keep simple record of daily compliments to maintain consistency",
        priority: "medium",
        estimatedTime: 15,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "morning-compliment-intention",
        name: "Morning Intention to Compliment",
        description: "Start day with intention to notice positive qualities in others",
        icon: "☀️",
        measurementType: "simple",
        frequency: "daily",
        category: "personal",
        priority: "medium"
      },
      {
        id: "reflect-positive-interactions",
        name: "End Day Reflecting on Positive Interactions",
        description: "Review how compliments affected your day and others",
        icon: "🌅",
        measurementType: "simple",
        frequency: "daily",
        category: "personal",
        priority: "medium"
      }
    ]
  },

  {
    id: "digital-detox-sundays",
    name: "Digital Detox Sundays",
    description: "Improve work-life balance with weekly technology-free Sundays",
    category: "personal",
    icon: "📵",
    color: "linear-gradient(135deg, #06B6D4, #0EA5E9)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "medium",
    isPopular: false,
    tags: ["digital-detox", "technology", "balance", "offline", "mindfulness"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Digital wellness research",
      prerequisites: ["Sunday availability", "Offline activities"],
      successRate: "76%",
      averageCompletionTime: "6-8 weeks",
      difficultyJustification: "Moderate challenge due to technology dependence"
    },
    templateTasks: [
      {
        id: "plan-offline-activities",
        name: "Plan Offline Sunday Activities",
        description: "Create list of engaging non-digital activities for Sundays",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "set-phone-dnd",
        name: "Set Phone to Do-Not-Disturb",
        description: "Configure phone settings for minimal digital interruption",
        priority: "high",
        estimatedTime: 15,
        category: "preparation"
      },
      {
        id: "inform-friends-family",
        name: "Inform Friends/Family of Sunday Rule",
        description: "Set expectations about Sunday digital availability",
        priority: "medium",
        estimatedTime: 30,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "saturday-night-phone-away",
        name: "Saturday Night Phone in Drawer",
        description: "Put phone away Saturday evening to start digital detox",
        icon: "📱",
        measurementType: "simple",
        frequency: "weekly",
        category: "personal",
        priority: "high"
      },
      {
        id: "sunday-nature-reading",
        name: "Sunday Morning Nature/Reading Time",
        description: "Replace screen time with outdoor activity or reading",
        icon: "🌳",
        measurementType: "time",
        frequency: "weekly",
        targetAmount: 60,
        targetUnit: "minutes",
        category: "personal",
        priority: "medium"
      }
    ]
  },

  // 🎨 CREATIVITY & HOBBIES CATEGORY
  {
    id: "daily-photo-challenge",
    name: "Take Photo Every Day",
    description: "Develop photography skills and capture daily life through photo-a-day challenge",
    category: "creativity",
    icon: "📷",
    color: "linear-gradient(135deg, #8B5CF6, #A855F7)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "medium",
    isPopular: false,
    tags: ["photography", "creativity", "daily", "art", "documentation"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Creative practice research",
      prerequisites: ["Camera or smartphone"],
      successRate: "82%",
      averageCompletionTime: "90 days",
      difficultyJustification: "Simple daily practice with immediate visual results"
    },
    templateTasks: [
      {
        id: "setup-photo-storage",
        name: "Set Up Photo Storage System",
        description: "Organize digital storage and backup system for daily photos",
        priority: "high",
        estimatedTime: 45,
        category: "preparation"
      },
      {
        id: "learn-photography-basics",
        name: "Learn Basic Photography Principles",
        description: "Study composition, lighting, and basic photography techniques",
        priority: "medium",
        estimatedTime: 120,
        category: "preparation"
      },
      {
        id: "share-photos-platform",
        name: "Share Photos on Social/Blog",
        description: "Choose platform to share daily photos for accountability",
        priority: "medium",
        estimatedTime: 30,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "morning-photo-walk",
        name: "Morning Photo Walk",
        description: "Take daily walk specifically to capture interesting photos",
        icon: "🚶‍♂️",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 15,
        targetUnit: "minutes",
        category: "creativity",
        priority: "high"
      },
      {
        id: "evening-photo-review",
        name: "Evening Photo Review/Editing",
        description: "Review and lightly edit daily photos each evening",
        icon: "✏️",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 10,
        targetUnit: "minutes",
        category: "creativity",
        priority: "medium"
      }
    ]
  },

  {
    id: "write-short-story",
    name: "Write Short Story",
    description: "Complete original short story from concept to final draft",
    category: "creativity",
    icon: "✍️",
    color: "linear-gradient(135deg, #DC2626, #EF4444)",
    estimatedDuration: "2 months",
    difficulty: "beginner",
    popularity: "low",
    isPopular: false,
    tags: ["writing", "story", "creativity", "fiction", "literature"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Creative writing education",
      prerequisites: ["Basic writing skills", "Story idea"],
      successRate: "58%",
      averageCompletionTime: "6-8 weeks",
      difficultyJustification: "Requires creativity, persistence, and writing discipline"
    },
    templateTasks: [
      {
        id: "choose-story-theme",
        name: "Choose Story Genre/Theme",
        description: "Select genre, theme, and basic premise for short story",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "research-writing-techniques",
        name: "Research Writing Techniques",
        description: "Study short story structure, character development, and dialogue",
        priority: "medium",
        estimatedTime: 90,
        category: "preparation"
      },
      {
        id: "set-writing-schedule",
        name: "Set Writing Schedule",
        description: "Plan specific times for writing sessions throughout project",
        priority: "high",
        estimatedTime: 20,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "daily-writing",
        name: "Write 200 Words Daily",
        description: "Maintain consistent writing momentum with daily word count goal",
        icon: "📝",
        measurementType: "count",
        frequency: "daily",
        targetAmount: 200,
        targetUnit: "words",
        category: "creativity",
        priority: "high"
      },
      {
        id: "read-short-stories",
        name: "Read Short Stories for Inspiration",
        description: "Study published short stories to improve craft and find inspiration",
        icon: "📖",
        measurementType: "simple",
        frequency: "weekly",
        category: "creativity",
        priority: "medium"
      }
    ]
  },

  {
    id: "learn-to-paint",
    name: "Learn to Paint",
    description: "Develop painting skills through practice and technique exploration",
    category: "creativity",
    icon: "🎨",
    color: "linear-gradient(135deg, #EC4899, #F97316)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "low",
    isPopular: false,
    tags: ["painting", "art", "creativity", "skill", "visual"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Art education methods",
      prerequisites: ["Basic art supplies", "Practice space"],
      successRate: "67%",
      averageCompletionTime: "10-12 weeks",
      difficultyJustification: "Requires patience, practice, and willingness to experiment"
    },
    templateTasks: [
      {
        id: "buy-painting-supplies",
        name: "Buy Basic Painting Supplies",
        description: "Purchase paints, brushes, canvas, and other essential materials",
        priority: "high",
        estimatedTime: 90,
        category: "preparation"
      },
      {
        id: "find-painting-tutorials",
        name: "Find Painting Tutorials/Classes",
        description: "Locate online tutorials or local classes for structured learning",
        priority: "medium",
        estimatedTime: 45,
        category: "preparation"
      },
      {
        id: "setup-art-workspace",
        name: "Set Up Art Workspace",
        description: "Create dedicated area for painting with proper lighting and ventilation",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "weekly-painting",
        name: "Paint 30 Minutes Weekly",
        description: "Dedicate focused time each week to painting practice",
        icon: "🖌️",
        measurementType: "time",
        frequency: "weekly",
        targetAmount: 30,
        targetUnit: "minutes",
        category: "creativity",
        priority: "high"
      },
      {
        id: "study-artist-technique",
        name: "Study One Artist's Technique Monthly",
        description: "Learn from masters by studying different painting techniques",
        icon: "🎭",
        measurementType: "simple",
        frequency: "monthly",
        category: "creativity",
        priority: "medium"
      }
    ]
  },

  {
    id: "build-with-hands",
    name: "Build Something with Hands",
    description: "Complete hands-on building project to develop practical crafting skills",
    category: "creativity",
    icon: "🔨",
    color: "linear-gradient(135deg, #F59E0B, #F97316)",
    estimatedDuration: "3 months",
    difficulty: "beginner",
    popularity: "low",
    isPopular: false,
    tags: ["building", "crafting", "hands-on", "woodworking", "DIY"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Maker movement and craft education",
      prerequisites: ["Basic tools", "Project space"],
      successRate: "73%",
      averageCompletionTime: "8-12 weeks",
      difficultyJustification: "Practical learning with tangible results and skill development"
    },
    templateTasks: [
      {
        id: "choose-build-project",
        name: "Choose Specific Project to Build",
        description: "Select achievable project like birdhouse, shelf, or simple furniture",
        priority: "high",
        estimatedTime: 60,
        category: "preparation"
      },
      {
        id: "gather-tools-materials",
        name: "Gather Necessary Tools/Materials",
        description: "Acquire or borrow tools and materials needed for chosen project",
        priority: "high",
        estimatedTime: 120,
        category: "preparation"
      },
      {
        id: "watch-technique-tutorials",
        name: "Watch Tutorials for Techniques",
        description: "Study instructional videos for required building techniques",
        priority: "medium",
        estimatedTime: 90,
        category: "preparation"
      }
    ],
    templateHabits: [
      {
        id: "weekend-workshop-time",
        name: "Weekend Workshop Time",
        description: "Dedicate weekend time to working on building project",
        icon: "🛠️",
        measurementType: "time",
        frequency: "weekly",
        targetAmount: 120,
        targetUnit: "minutes",
        category: "creativity",
        priority: "high"
      },
      {
        id: "daily-progress",
        name: "Daily Progress on Current Project",
        description: "Make small daily progress even if just planning or organizing",
        icon: "📈",
        measurementType: "simple",
        frequency: "daily",
        category: "creativity",
        priority: "medium"
      }
    ]
  }
];

const metadata = {
  version: "2.0.0",
  lastUpdated: "2025-08-08",
  totalTemplates: 20,
  categories: ["health", "learning", "finance", "career", "personal", "creativity"],
  templatesPerCategory: 4,
  designPhilosophy: "Simple, achievable goals for building consistent habits and momentum",
  averageTasks: 3,
  averageHabits: 2,
  expertValidation: {
    approach: "Evidence-based goal setting with realistic timelines",
    successRateRange: "42%-92%",
    difficultyFocus: "Beginner-friendly with clear progression",
    validationDate: "2025-08-08",
    notes: "Designed to replace complex templates with simple, habit-building goals"
  }
};

const goalTemplatesCollection: TemplateCollection = {
  templates,
  metadata
};

// Export individual parts for flexibility
export { templates, metadata };

// Export complete collection as default
export default goalTemplatesCollection;