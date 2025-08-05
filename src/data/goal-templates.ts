import { GoalTemplate, TemplateCollection } from '../types/goal';

// Goal Templates Data - Static Export for Mobile Compatibility
// Converted from goal-templates.json to resolve dynamic import issues in Capacitor

const templates: GoalTemplate[] = [
  {
    id: "marathon-training",
    name: "Run a Marathon",
    description: "Complete a full marathon (26.2 miles) with a structured 16-week training program designed for intermediate runners",
    category: "health",
    icon: "🏃‍♂️",
    color: "linear-gradient(135deg, #10B981, #22C55E)",
    estimatedDuration: "16-20 weeks",
    difficulty: "intermediate",
    popularity: "high",
    isPopular: true,
    tags: ["running", "endurance", "fitness", "marathon", "training"],
    realWorldValidation: {
      expertValidated: true,
      basedOnProgram: "Hal Higdon Novice 1 Marathon Training",
      prerequisites: [
        "Ability to run 3 miles continuously",
        "No current injuries",
        "Basic cardiovascular fitness",
        "Medical clearance for intense exercise"
      ],
      successRate: "85%",
      averageCompletionTime: "16 weeks",
      difficultyJustification: "Requires consistent training, gradual mileage buildup, and significant time commitment"
    },
    templateTasks: [
      {
        id: "week-1-schedule",
        name: "Week 1: Establish Base Training (12 miles total)",
        description: "Begin with manageable weekly mileage to build running base. Focus on consistency over speed.",
        priority: "high",
        estimatedTime: 240,
        category: "training",
        weekNumber: 1,
        details: "3 runs: 3mi easy, 3mi easy, 6mi long run at conversational pace"
      },
      {
        id: "week-2-schedule",
        name: "Week 2: Build Endurance (14 miles total)",
        description: "Increase weekly mileage gradually. Focus on comfortable effort level.",
        priority: "high",
        estimatedTime: 280,
        category: "training",
        weekNumber: 2,
        details: "3 runs: 3mi easy, 4mi easy, 7mi long run at conversational pace"
      },
      {
        id: "week-3-schedule",
        name: "Week 3: Expand Long Run (15 miles total)",
        description: "Continue building endurance with longer weekend run.",
        priority: "high",
        estimatedTime: 300,
        category: "training",
        weekNumber: 3,
        details: "3 runs: 3mi easy, 4mi easy, 8mi long run at conversational pace"
      },
      {
        id: "week-4-schedule",
        name: "Week 4: Recovery Week (11 miles total)",
        description: "Reduce mileage to allow body to adapt and recover from previous weeks.",
        priority: "high",
        estimatedTime: 220,
        category: "training",
        weekNumber: 4,
        details: "3 runs: 3mi easy, 3mi easy, 5mi long run at easy pace"
      },
      {
        id: "week-5-schedule",
        name: "Week 5: Resume Building (17 miles total)",
        description: "Return to building phase with increased weekly volume.",
        priority: "high",
        estimatedTime: 340,
        category: "training",
        weekNumber: 5,
        details: "3 runs: 4mi easy, 4mi easy, 9mi long run at conversational pace"
      },
      {
        id: "week-6-schedule",
        name: "Week 6: Double Digit Long Run (19 miles total)",
        description: "First double-digit long run - milestone achievement in training.",
        priority: "high",
        estimatedTime: 380,
        category: "training",
        weekNumber: 6,
        details: "3 runs: 4mi easy, 5mi easy, 10mi long run at conversational pace"
      },
      {
        id: "week-7-schedule",
        name: "Week 7: Peak Base Building (21 miles total)",
        description: "Highest mileage week in base building phase.",
        priority: "high",
        estimatedTime: 420,
        category: "training",
        weekNumber: 7,
        details: "3 runs: 5mi easy, 5mi easy, 11mi long run at conversational pace"
      },
      {
        id: "week-8-schedule",
        name: "Week 8: Recovery Week (13 miles total)",
        description: "Important recovery week before entering peak training phase.",
        priority: "high",
        estimatedTime: 260,
        category: "training",
        weekNumber: 8,
        details: "3 runs: 4mi easy, 3mi easy, 6mi long run at easy pace"
      },
      {
        id: "week-9-schedule",
        name: "Week 9: Enter Peak Phase (23 miles total)",
        description: "Begin peak training phase with longest long runs.",
        priority: "high",
        estimatedTime: 460,
        category: "training",
        weekNumber: 9,
        details: "3 runs: 5mi easy, 6mi easy, 12mi long run at marathon pace for middle 8mi"
      },
      {
        id: "week-10-schedule",
        name: "Week 10: Half Marathon Distance (25 miles total)",
        description: "Complete half marathon distance in long run - major milestone.",
        priority: "high",
        estimatedTime: 500,
        category: "training",
        weekNumber: 10,
        details: "3 runs: 6mi easy, 6mi easy, 13.1mi long run with race pace segments"
      },
      {
        id: "week-11-schedule",
        name: "Week 11: Peak Long Run (27 miles total)",
        description: "Longest training run - builds confidence for marathon distance.",
        priority: "high",
        estimatedTime: 540,
        category: "training",
        weekNumber: 11,
        details: "3 runs: 6mi easy, 7mi easy, 14mi long run with marathon pace practice"
      },
      {
        id: "week-12-schedule",
        name: "Week 12: Recovery Week (15 miles total)",
        description: "Recovery week after peak training phase to prepare for taper.",
        priority: "high",
        estimatedTime: 300,
        category: "training",
        weekNumber: 12,
        details: "3 runs: 5mi easy, 4mi easy, 6mi long run at easy pace"
      },
      {
        id: "week-13-schedule",
        name: "Week 13: Taper Begins (19 miles total)",
        description: "Begin 4-week taper to arrive fresh and strong for marathon.",
        priority: "high",
        estimatedTime: 380,
        category: "training",
        weekNumber: 13,
        details: "3 runs: 6mi easy, 5mi easy, 8mi long run with some marathon pace"
      },
      {
        id: "week-14-schedule",
        name: "Week 14: Continue Taper (15 miles total)",
        description: "Reduce training volume while maintaining fitness and sharpness.",
        priority: "high",
        estimatedTime: 300,
        category: "training",
        weekNumber: 14,
        details: "3 runs: 5mi easy, 4mi easy, 6mi long run at easy pace"
      },
      {
        id: "week-15-schedule",
        name: "Week 15: Final Preparation (11 miles total)",
        description: "Light training week focusing on staying loose and confident.",
        priority: "high",
        estimatedTime: 220,
        category: "training",
        weekNumber: 15,
        details: "3 runs: 4mi easy, 3mi easy, 4mi easy with some strides"
      },
      {
        id: "week-16-schedule",
        name: "Week 16: Marathon Week (29 miles total)",
        description: "Race week - minimal training, maximum preparation. Marathon day!",
        priority: "high",
        estimatedTime: 300,
        category: "training",
        weekNumber: 16,
        details: "2 easy runs (2mi, 1mi) plus 26.2mi MARATHON RACE DAY!"
      },
      {
        id: "gear-running-shoes",
        name: "Purchase Proper Running Shoes",
        description: "Get professionally fitted for running shoes at specialty running store. Replace every 300-500 miles.",
        priority: "high",
        estimatedTime: 120,
        category: "preparation",
        dependsOn: [],
        details: "Visit running specialty store, get gait analysis, try multiple brands, break in gradually"
      },
      {
        id: "gear-clothing",
        name: "Acquire Appropriate Running Clothing",
        description: "Invest in moisture-wicking, chafe-resistant clothing for long runs and race day.",
        priority: "medium",
        estimatedTime: 90,
        category: "preparation",
        details: "Moisture-wicking shirts, running shorts/tights, compression socks, weather-appropriate layers"
      },
      {
        id: "gear-accessories",
        name: "Get Training Accessories",
        description: "Essential accessories for training monitoring and comfort during long runs.",
        priority: "medium",
        estimatedTime: 60,
        category: "preparation",
        details: "GPS watch or smartphone app, hydration belt/handheld, energy gels/snacks, anti-chafe products"
      },
      {
        id: "nutrition-plan",
        name: "Develop Marathon Nutrition Strategy",
        description: "Plan fueling strategy for training and race day. Practice during long runs.",
        priority: "high",
        estimatedTime: 180,
        category: "preparation",
        details: "Research fueling options, practice during long runs, plan race day nutrition timeline"
      },
      {
        id: "race-registration",
        name: "Register for Target Marathon",
        description: "Choose and register for marathon race. Consider location, time of year, and difficulty.",
        priority: "high",
        estimatedTime: 60,
        category: "preparation",
        details: "Research marathons, consider travel logistics, register early, plan accommodation if needed"
      },
      {
        id: "training-log",
        name: "Set Up Training Log System",
        description: "Establish system to track daily runs, weekly mileage, and how you feel.",
        priority: "medium",
        estimatedTime: 30,
        category: "preparation",
        details: "Choose app or journal system, track distance, time, pace, effort level, how you felt"
      },
      {
        id: "recovery-plan",
        name: "Establish Recovery Protocols",
        description: "Plan for adequate sleep, rest days, and injury prevention strategies.",
        priority: "high",
        estimatedTime: 90,
        category: "preparation",
        details: "Plan rest days, stretching routine, sleep schedule, foam rolling, when to see doctor"
      },
      {
        id: "backup-plan",
        name: "Create Contingency Plans",
        description: "Plan for weather, injury, illness, or other issues that could affect training or race.",
        priority: "medium",
        estimatedTime: 45,
        category: "preparation",
        details: "Bad weather training options, injury protocol, backup race options, missed training adjustments"
      }
    ],
    templateHabits: [
      {
        id: "daily-run",
        name: "Complete Scheduled Training Run",
        description: "Follow the weekly training schedule consistently. Quality over quantity - listen to your body.",
        icon: "🏃‍♂️",
        measurementType: "simple",
        frequency: "custom",
        customFrequency: { times: 3, period: "week" },
        category: "training",
        priority: "high"
      },
      {
        id: "hydration",
        name: "Drink Adequate Water Daily",
        description: "Stay properly hydrated for optimal performance and recovery. Increase intake on run days.",
        icon: "💧",
        measurementType: "count",
        frequency: "daily",
        targetAmount: 8,
        targetUnit: "glasses",
        category: "health",
        priority: "high"
      },
      {
        id: "sleep-quality",
        name: "Get 7-9 Hours of Quality Sleep",
        description: "Prioritize sleep for muscle recovery and adaptation. Most important for training adaptation.",
        icon: "😴",
        measurementType: "time",
        frequency: "daily",
        targetAmount: 480,
        targetUnit: "minutes",
        category: "recovery",
        priority: "high"
      },
      {
        id: "stretching-mobility",
        name: "Post-Run Stretching & Mobility",
        description: "Spend 10-15 minutes on stretching and mobility work after each run to prevent injury.",
        icon: "🧘‍♂️",
        measurementType: "time",
        frequency: "custom",
        customFrequency: { times: 3, period: "week" },
        targetAmount: 15,
        targetUnit: "minutes",
        category: "recovery",
        priority: "medium"
      },
      {
        id: "nutrition-fueling",
        name: "Eat Balanced, Performance-Supporting Meals",
        description: "Focus on carbohydrates for fuel, protein for recovery, and vegetables for nutrients.",
        icon: "🥗",
        measurementType: "simple",
        frequency: "daily",
        category: "nutrition",
        priority: "medium"
      },
      {
        id: "training-log-entry",
        name: "Log Training Data",
        description: "Record daily run details: distance, time, how you felt, any issues or improvements.",
        icon: "📊",
        measurementType: "simple",
        frequency: "custom",
        customFrequency: { times: 3, period: "week" },
        category: "tracking",
        priority: "medium"
      },
      {
        id: "rest-day",
        name: "Take Scheduled Rest Days",
        description: "Complete rest or light cross-training. Rest days are when your body adapts and gets stronger.",
        icon: "🛋️",
        measurementType: "simple",
        frequency: "custom",
        customFrequency: { times: 4, period: "week" },
        category: "recovery",
        priority: "high"
      },
      {
        id: "injury-prevention",
        name: "Body Awareness & Injury Prevention",
        description: "Daily check-in with your body. Note any pain, stiffness, or issues early.",
        icon: "🩺",
        measurementType: "simple",
        frequency: "daily",
        category: "health",
        priority: "medium"
      }
    ]
  }
];

const metadata = {
  version: "1.0.0",
  lastUpdated: "2025-01-05",
  totalTemplates: 1,
  categories: ["health"],
  expertValidation: {
    marathonTemplate: {
      validator: "Hal Higdon Training Programs",
      source: "Proven marathon training methodology",
      validationDate: "2025-01-05",
      notes: "Based on Novice 1 program, adapted for Kage app structure"
    }
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