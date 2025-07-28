import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OnboardingStep, CategoryOption, GoalTemplate, OnboardingData } from '../types/onboarding'

interface OnboardingStore {
  // State
  currentStep: OnboardingStep
  onboardingData: OnboardingData
  isOnboardingActive: boolean
  
  // Actions
  setCurrentStep: (step: OnboardingStep) => void
  setSelectedCategory: (categoryId: string) => void
  setSelectedTemplate: (template: GoalTemplate) => void
  setUserInfo: (name: string, email: string) => void
  setSkipAI: (skip: boolean) => void
  startOnboarding: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  
  // Data getters
  getCategories: () => CategoryOption[]
  getTemplatesForCategory: (categoryId: string) => GoalTemplate[]
}

// Predefined categories
const CATEGORIES: CategoryOption[] = [
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Exercise, nutrition, wellness',
    icon: '🏃'
  },
  {
    id: 'career',
    name: 'Career & Business',
    description: 'Skills, projects, growth',
    icon: '🚀'
  },
  {
    id: 'learning',
    name: 'Learning & Skills',
    description: 'Education, languages, hobbies',
    icon: '📚'
  },
  {
    id: 'personal',
    name: 'Personal Growth',
    description: 'Mindfulness, relationships',
    icon: '🧘'
  },
  {
    id: 'financial',
    name: 'Financial',
    description: 'Saving, budgeting, investing',
    icon: '💰'
  },
  {
    id: 'creative',
    name: 'Creative & Hobbies',
    description: 'Art, music, crafts',
    icon: '🎨'
  }
]

// Predefined templates based on HTML mockup
const TEMPLATES: Record<string, GoalTemplate[]> = {
  health: [
    {
      id: 'get-fit-strong',
      icon: '💪',
      name: 'Get Fit & Strong',
      duration: '3-6 months',
      description: 'Build a consistent workout routine and develop healthy eating habits.',
      taskCount: 8,
      habitCount: 5,
      category: 'health',
      tasks: [
        { name: 'Set up gym membership', description: 'Research and join a local gym', type: 'standard', priority: 'high' },
        { name: 'Plan weekly workout schedule', description: 'Create a 4-day workout routine', type: 'standard', priority: 'high' },
        { name: 'Buy workout gear', description: 'Get proper shoes and workout clothes', type: 'to-buy', priority: 'medium' },
        { name: 'Schedule fitness assessment', description: 'Book initial fitness evaluation', type: 'deadline', priority: 'medium' },
        { name: 'Plan meal prep routine', description: 'Design weekly meal planning system', type: 'standard', priority: 'high' },
        { name: 'Buy healthy groceries', description: 'Stock up on nutritious foods', type: 'to-buy', priority: 'medium' },
        { name: 'Find workout buddy', description: 'Connect with accountability partner', type: 'standard', priority: 'low' },
        { name: 'Track first month progress', description: 'Measure and document improvements', type: 'standard', priority: 'medium' }
      ],
      habits: [
        { name: 'Morning workout', description: '30-45 minutes of exercise', frequency: 'daily', icon: '💪' },
        { name: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day', frequency: 'daily', icon: '💧' },
        { name: 'Take progress photos', description: 'Document fitness journey', frequency: 'weekly', selectedDays: ['sun'], icon: '📸' },
        { name: 'Meal prep', description: 'Prepare healthy meals for the week', frequency: 'weekly', selectedDays: ['sun'], icon: '🥗' },
        { name: 'Sleep 8 hours', description: 'Prioritize recovery and rest', frequency: 'daily', icon: '😴' }
      ]
    },
    {
      id: 'run-marathon',
      icon: '🏃',
      name: 'Run a Marathon',
      duration: '4-6 months',
      description: 'Complete training plan to successfully finish your first marathon.',
      taskCount: 12,
      habitCount: 6,
      category: 'health',
      tasks: [
        { name: 'Get running shoes fitted', description: 'Professional gait analysis and fitting', type: 'standard', priority: 'urgent' },
        { name: 'Create training schedule', description: '16-week marathon training plan', type: 'standard', priority: 'high' },
        { name: 'Register for marathon', description: 'Sign up for target marathon event', type: 'deadline', priority: 'high' },
        { name: 'Plan nutrition strategy', description: 'Research race day fueling', type: 'standard', priority: 'medium' },
        { name: 'Buy running gear', description: 'Clothes, watch, accessories', type: 'to-buy', priority: 'medium' },
        { name: 'Find running routes', description: 'Map out various distance routes', type: 'standard', priority: 'medium' },
        { name: 'Schedule long runs', description: 'Plan weekend long run schedule', type: 'standard', priority: 'high' },
        { name: 'Join running group', description: 'Find local running community', type: 'standard', priority: 'low' },
        { name: 'Practice race pace', description: 'Train at target marathon pace', type: 'standard', priority: 'medium' },
        { name: 'Plan taper strategy', description: 'Reduce training before race', type: 'standard', priority: 'medium' },
        { name: 'Prepare race day logistics', description: 'Plan transportation and timing', type: 'standard', priority: 'high' },
        { name: 'Celebrate completion', description: 'Plan post-marathon celebration', type: 'standard', priority: 'low' }
      ],
      habits: [
        { name: 'Daily run', description: 'Follow training plan schedule', frequency: 'daily', icon: '🏃' },
        { name: 'Stretching routine', description: '15 minutes of stretching', frequency: 'daily', icon: '🤸' },
        { name: 'Strength training', description: 'Runner-specific strength work', frequency: 'weekly', selectedDays: ['tue', 'thu'], icon: '🏋️' },
        { name: 'Hydration tracking', description: 'Monitor water intake', frequency: 'daily', icon: '💧' },
        { name: 'Sleep optimization', description: '8+ hours quality sleep', frequency: 'daily', icon: '😴' },
        { name: 'Recovery activities', description: 'Foam rolling, massage, etc.', frequency: 'weekly', selectedDays: ['sun'], icon: '🛁' }
      ]
    },
    {
      id: 'healthy-eating',
      icon: '🥗',
      name: 'Healthy Eating',
      duration: '2-3 months',
      description: 'Develop sustainable eating habits and meal planning skills.',
      taskCount: 6,
      habitCount: 7,
      category: 'health',
      tasks: [
        { name: 'Clean out pantry', description: 'Remove processed and unhealthy foods', type: 'standard', priority: 'high' },
        { name: 'Create healthy grocery list', description: 'Plan nutritious shopping list', type: 'standard', priority: 'high' },
        { name: 'Buy meal prep containers', description: 'Get proper food storage containers', type: 'to-buy', priority: 'medium' },
        { name: 'Learn healthy recipes', description: 'Find 20 go-to healthy meals', type: 'standard', priority: 'medium' },
        { name: 'Plan weekly menus', description: 'Design weekly meal planning system', type: 'standard', priority: 'high' },
        { name: 'Set up nutrition tracking', description: 'Choose app or method to track intake', type: 'standard', priority: 'medium' }
      ],
      habits: [
        { name: 'Drink water before meals', description: 'Stay hydrated and aid digestion', frequency: 'daily', icon: '💧' },
        { name: 'Eat 5 servings of vegetables', description: 'Prioritize vegetable intake', frequency: 'daily', icon: '🥬' },
        { name: 'Meal prep on Sunday', description: 'Prepare meals for the week', frequency: 'weekly', selectedDays: ['sun'], icon: '🍱' },
        { name: 'Cook dinner at home', description: 'Avoid takeout and cook fresh meals', frequency: 'daily', icon: '👨‍🍳' },
        { name: 'Take vitamins', description: 'Daily vitamin supplement', frequency: 'daily', icon: '💊' },
        { name: 'Read nutrition labels', description: 'Make informed food choices', frequency: 'daily', icon: '🔍' },
        { name: 'Plan next day meals', description: 'Prepare mentally for healthy choices', frequency: 'daily', icon: '📝' }
      ]
    }
  ],
  career: [
    {
      id: 'launch-side-project',
      icon: '🚀',
      name: 'Launch Side Project',
      duration: '3-4 months',
      description: 'Take your idea from concept to launch with structured milestones.',
      taskCount: 15,
      habitCount: 4,
      category: 'career',
      tasks: [
        { name: 'Define project scope', description: 'Clearly outline project goals and features', type: 'standard', priority: 'urgent' },
        { name: 'Market research', description: 'Research target audience and competitors', type: 'standard', priority: 'high' },
        { name: 'Create project timeline', description: 'Break down project into milestones', type: 'standard', priority: 'high' },
        { name: 'Set up development environment', description: 'Configure tools and workspace', type: 'standard', priority: 'high' },
        { name: 'Design user interface', description: 'Create mockups and user flow', type: 'standard', priority: 'medium' },
        { name: 'Build MVP', description: 'Develop minimum viable product', type: 'standard', priority: 'high' },
        { name: 'Set up hosting', description: 'Choose and configure hosting platform', type: 'standard', priority: 'medium' },
        { name: 'Create landing page', description: 'Build marketing website', type: 'standard', priority: 'medium' },
        { name: 'Beta testing', description: 'Get feedback from test users', type: 'standard', priority: 'medium' },
        { name: 'Fix bugs and iterate', description: 'Improve based on feedback', type: 'standard', priority: 'high' },
        { name: 'Launch marketing plan', description: 'Prepare launch strategy', type: 'standard', priority: 'medium' },
        { name: 'Go live', description: 'Official project launch', type: 'deadline', priority: 'urgent' },
        { name: 'Monitor analytics', description: 'Track project performance', type: 'standard', priority: 'medium' },
        { name: 'Gather user feedback', description: 'Collect post-launch insights', type: 'standard', priority: 'medium' },
        { name: 'Plan next iteration', description: 'Roadmap for future improvements', type: 'standard', priority: 'low' }
      ],
      habits: [
        { name: 'Daily coding', description: '2 hours of focused development work', frequency: 'daily', icon: '💻' },
        { name: 'Weekly progress review', description: 'Assess progress and adjust plans', frequency: 'weekly', selectedDays: ['sun'], icon: '📊' },
        { name: 'Learn new skills', description: 'Study relevant technologies', frequency: 'daily', icon: '📚' },
        { name: 'Network with creators', description: 'Connect with other entrepreneurs', frequency: 'weekly', selectedDays: ['fri'], icon: '🤝' }
      ]
    },
    {
      id: 'get-promoted',
      icon: '📈',
      name: 'Get Promoted',
      duration: '6-12 months',
      description: 'Strategic career development plan to earn your next promotion.',
      taskCount: 10,
      habitCount: 5,
      category: 'career',
      tasks: [
        { name: 'Schedule career conversation', description: 'Meet with manager to discuss goals', type: 'deadline', priority: 'urgent' },
        { name: 'Identify skill gaps', description: 'Assess areas for improvement', type: 'standard', priority: 'high' },
        { name: 'Create development plan', description: 'Outline specific growth activities', type: 'standard', priority: 'high' },
        { name: 'Find internal mentor', description: 'Connect with senior colleague', type: 'standard', priority: 'medium' },
        { name: 'Take on stretch project', description: 'Volunteer for challenging assignment', type: 'standard', priority: 'high' },
        { name: 'Attend leadership training', description: 'Enroll in professional development', type: 'standard', priority: 'medium' },
        { name: 'Build cross-team relationships', description: 'Network within organization', type: 'standard', priority: 'medium' },
        { name: 'Document achievements', description: 'Track accomplishments and impact', type: 'standard', priority: 'high' },
        { name: 'Seek feedback regularly', description: 'Request input from colleagues', type: 'standard', priority: 'medium' },
        { name: 'Apply for promotion', description: 'Submit formal promotion request', type: 'deadline', priority: 'urgent' }
      ],
      habits: [
        { name: 'Arrive early to work', description: 'Show dedication and preparation', frequency: 'daily', icon: '⏰' },
        { name: 'Weekly skill learning', description: 'Study industry trends and skills', frequency: 'weekly', selectedDays: ['sat'], icon: '📚' },
        { name: 'Network lunch meetings', description: 'Build professional relationships', frequency: 'weekly', selectedDays: ['wed'], icon: '🍽️' },
        { name: 'Update achievements log', description: 'Record daily accomplishments', frequency: 'daily', icon: '📝' },
        { name: 'Volunteer for projects', description: 'Show initiative and leadership', frequency: 'weekly', selectedDays: ['mon'], icon: '🙋' }
      ]
    }
  ],
  learning: [
    {
      id: 'learn-spanish',
      icon: '🗣️',
      name: 'Learn Spanish',
      duration: '6-12 months',
      description: 'Achieve conversational fluency through daily practice and immersion.',
      taskCount: 8,
      habitCount: 6,
      category: 'learning',
      tasks: [
        { name: 'Choose learning platform', description: 'Select app or course for structure', type: 'standard', priority: 'urgent' },
        { name: 'Set up study space', description: 'Create dedicated learning environment', type: 'standard', priority: 'medium' },
        { name: 'Buy Spanish resources', description: 'Get textbooks, dictionary, materials', type: 'to-buy', priority: 'medium' },
        { name: 'Find conversation partner', description: 'Connect with native Spanish speaker', type: 'standard', priority: 'high' },
        { name: 'Join Spanish meetup', description: 'Find local Spanish practice group', type: 'standard', priority: 'medium' },
        { name: 'Plan immersion activities', description: 'Spanish movies, music, podcasts', type: 'standard', priority: 'medium' },
        { name: 'Schedule progress test', description: 'Take proficiency assessment', type: 'deadline', priority: 'medium' },
        { name: 'Plan Spanish trip', description: 'Visit Spanish-speaking country', type: 'standard', priority: 'low' }
      ],
      habits: [
        { name: 'Daily Spanish lessons', description: '30 minutes of structured learning', frequency: 'daily', icon: '📚' },
        { name: 'Spanish conversation practice', description: 'Speak with tutor or partner', frequency: 'weekly', selectedDays: ['tue', 'thu'], icon: '🗣️' },
        { name: 'Watch Spanish content', description: 'Movies, shows, or YouTube videos', frequency: 'daily', icon: '📺' },
        { name: 'Spanish music listening', description: 'Immerse in Spanish audio', frequency: 'daily', icon: '🎵' },
        { name: 'Vocabulary flashcards', description: 'Review and learn new words', frequency: 'daily', icon: '📚' },
        { name: 'Spanish journaling', description: 'Write thoughts in Spanish', frequency: 'daily', icon: '✍️' }
      ]
    },
    {
      id: 'master-programming',
      icon: '💻',
      name: 'Master Programming',
      duration: '4-8 months',
      description: 'Build coding skills from beginner to job-ready developer.',
      taskCount: 12,
      habitCount: 4,
      category: 'learning',
      tasks: [
        { name: 'Choose programming language', description: 'Select primary language to focus on', type: 'standard', priority: 'urgent' },
        { name: 'Set up development environment', description: 'Install necessary tools and editors', type: 'standard', priority: 'high' },
        { name: 'Complete beginner course', description: 'Finish comprehensive online course', type: 'standard', priority: 'high' },
        { name: 'Build first project', description: 'Create simple application', type: 'standard', priority: 'high' },
        { name: 'Learn version control', description: 'Master Git and GitHub', type: 'standard', priority: 'high' },
        { name: 'Study data structures', description: 'Learn algorithms and data structures', type: 'standard', priority: 'medium' },
        { name: 'Build portfolio projects', description: 'Create 3-5 showcase projects', type: 'standard', priority: 'high' },
        { name: 'Learn web frameworks', description: 'Study popular frameworks', type: 'standard', priority: 'medium' },
        { name: 'Practice coding challenges', description: 'Solve problems on coding platforms', type: 'standard', priority: 'medium' },
        { name: 'Create GitHub portfolio', description: 'Showcase projects professionally', type: 'standard', priority: 'high' },
        { name: 'Apply for internships', description: 'Seek real-world experience', type: 'standard', priority: 'medium' },
        { name: 'Prepare for interviews', description: 'Practice technical interviews', type: 'standard', priority: 'high' }
      ],
      habits: [
        { name: 'Daily coding practice', description: '2-3 hours of programming', frequency: 'daily', icon: '💻' },
        { name: 'Weekly project work', description: 'Focus on portfolio projects', frequency: 'weekly', selectedDays: ['sat', 'sun'], icon: '🛠️' },
        { name: 'Algorithm practice', description: 'Solve coding challenges', frequency: 'daily', icon: '🧩' },
        { name: 'Tech article reading', description: 'Stay updated with industry trends', frequency: 'daily', icon: '📰' }
      ]
    }
  ],
  personal: [
    {
      id: 'mindfulness-practice',
      icon: '🧘',
      name: 'Mindfulness Practice',
      duration: '2-4 months',
      description: 'Develop a daily meditation practice for mental clarity and peace.',
      taskCount: 5,
      habitCount: 4,
      category: 'personal',
      tasks: [
        { name: 'Download meditation app', description: 'Choose guided meditation platform', type: 'standard', priority: 'high' },
        { name: 'Set up meditation space', description: 'Create quiet, peaceful environment', type: 'standard', priority: 'medium' },
        { name: 'Buy meditation cushion', description: 'Get comfortable seating', type: 'to-buy', priority: 'low' },
        { name: 'Read mindfulness book', description: 'Learn meditation principles', type: 'standard', priority: 'medium' },
        { name: 'Join meditation group', description: 'Find local or online community', type: 'standard', priority: 'low' }
      ],
      habits: [
        { name: 'Daily meditation', description: '10-20 minutes of mindfulness', frequency: 'daily', icon: '🧘' },
        { name: 'Gratitude journaling', description: 'Write 3 things you\'re grateful for', frequency: 'daily', icon: '🙏' },
        { name: 'Mindful walking', description: 'Present-moment awareness during walks', frequency: 'daily', icon: '🚶' },
        { name: 'Breathing exercises', description: 'Practice deep breathing techniques', frequency: 'daily', icon: '💨' }
      ]
    },
    {
      id: 'read-more-books',
      icon: '📖',
      name: 'Read More Books',
      duration: '12 months',
      description: 'Build a consistent reading habit and expand your knowledge.',
      taskCount: 6,
      habitCount: 3,
      category: 'personal',
      tasks: [
        { name: 'Create reading list', description: 'Choose 24 books for the year', type: 'standard', priority: 'high' },
        { name: 'Set up reading space', description: 'Create comfortable reading environment', type: 'standard', priority: 'medium' },
        { name: 'Join library', description: 'Get library card and explore resources', type: 'standard', priority: 'medium' },
        { name: 'Find reading time', description: 'Block out daily reading schedule', type: 'standard', priority: 'high' },
        { name: 'Join book club', description: 'Connect with other readers', type: 'standard', priority: 'low' },
        { name: 'Track reading progress', description: 'Use app or journal to monitor', type: 'standard', priority: 'medium' }
      ],
      habits: [
        { name: 'Daily reading', description: '30 minutes of book reading', frequency: 'daily', icon: '📚' },
        { name: 'Weekly book notes', description: 'Summarize key insights', frequency: 'weekly', selectedDays: ['sun'], icon: '📝' },
        { name: 'Share book recommendations', description: 'Discuss books with friends', frequency: 'weekly', selectedDays: ['fri'], icon: '💬' }
      ]
    }
  ],
  financial: [
    {
      id: 'build-emergency-fund',
      icon: '💰',
      name: 'Build Emergency Fund',
      duration: '6-12 months',
      description: 'Save 3-6 months of expenses for financial security.',
      taskCount: 8,
      habitCount: 5,
      category: 'financial',
      tasks: [
        { name: 'Calculate monthly expenses', description: 'Determine exact emergency fund target', type: 'standard', priority: 'urgent' },
        { name: 'Open high-yield savings', description: 'Find best emergency fund account', type: 'standard', priority: 'high' },
        { name: 'Set up automatic transfer', description: 'Automate emergency fund savings', type: 'standard', priority: 'high' },
        { name: 'Create monthly budget', description: 'Plan income and expense allocation', type: 'standard', priority: 'high' },
        { name: 'Find extra income', description: 'Identify ways to increase earnings', type: 'standard', priority: 'medium' },
        { name: 'Cut unnecessary expenses', description: 'Reduce spending to save more', type: 'standard', priority: 'medium' },
        { name: 'Set savings milestones', description: 'Celebrate progress markers', type: 'standard', priority: 'medium' },
        { name: 'Review and adjust plan', description: 'Monthly progress assessment', type: 'standard', priority: 'medium' }
      ],
      habits: [
        { name: 'Daily expense tracking', description: 'Record all spending', frequency: 'daily', icon: '💳' },
        { name: 'Weekly budget review', description: 'Check spending against budget', frequency: 'weekly', selectedDays: ['sun'], icon: '📊' },
        { name: 'Save spare change', description: 'Add loose change to savings', frequency: 'daily', icon: '🪙' },
        { name: 'Cook meals at home', description: 'Reduce food expenses', frequency: 'daily', icon: '🍳' },
        { name: 'Monthly savings review', description: 'Assess emergency fund progress', frequency: 'weekly', selectedDays: ['sat'], icon: '📈' }
      ]
    },
    {
      id: 'start-investing',
      icon: '📊',
      name: 'Start Investing',
      duration: '3-6 months',
      description: 'Learn investment basics and build a diversified portfolio.',
      taskCount: 10,
      habitCount: 4,
      category: 'financial',
      tasks: [
        { name: 'Learn investment basics', description: 'Study stocks, bonds, and funds', type: 'standard', priority: 'urgent' },
        { name: 'Assess risk tolerance', description: 'Determine investment comfort level', type: 'standard', priority: 'high' },
        { name: 'Open investment account', description: 'Choose and set up brokerage account', type: 'standard', priority: 'high' },
        { name: 'Set investment goals', description: 'Define timeline and objectives', type: 'standard', priority: 'high' },
        { name: 'Research investment options', description: 'Compare stocks, ETFs, mutual funds', type: 'standard', priority: 'medium' },
        { name: 'Create investment strategy', description: 'Plan portfolio allocation', type: 'standard', priority: 'high' },
        { name: 'Make first investment', description: 'Purchase initial holdings', type: 'standard', priority: 'high' },
        { name: 'Set up automatic investing', description: 'Automate regular contributions', type: 'standard', priority: 'medium' },
        { name: 'Monitor portfolio', description: 'Track investment performance', type: 'standard', priority: 'medium' },
        { name: 'Rebalance portfolio', description: 'Adjust allocation as needed', type: 'standard', priority: 'low' }
      ],
      habits: [
        { name: 'Daily market reading', description: 'Stay informed about market news', frequency: 'daily', icon: '📰' },
        { name: 'Weekly portfolio review', description: 'Check investment performance', frequency: 'weekly', selectedDays: ['sat'], icon: '📊' },
        { name: 'Monthly investing', description: 'Add money to investment account', frequency: 'weekly', selectedDays: ['fri'], icon: '💰' },
        { name: 'Investment learning', description: 'Study investment strategies', frequency: 'weekly', selectedDays: ['sun'], icon: '📚' }
      ]
    }
  ],
  creative: [
    {
      id: 'learn-digital-art',
      icon: '🎨',
      name: 'Learn Digital Art',
      duration: '4-8 months',
      description: 'Master digital art tools and techniques for creative expression.',
      taskCount: 9,
      habitCount: 5,
      category: 'creative',
      tasks: [
        { name: 'Choose digital art software', description: 'Select Photoshop, Procreate, or similar', type: 'standard', priority: 'urgent' },
        { name: 'Buy digital drawing tablet', description: 'Get proper drawing hardware', type: 'to-buy', priority: 'high' },
        { name: 'Take online art course', description: 'Enroll in structured learning program', type: 'standard', priority: 'high' },
        { name: 'Set up art workspace', description: 'Create comfortable drawing environment', type: 'standard', priority: 'medium' },
        { name: 'Study art fundamentals', description: 'Learn color theory, composition, etc.', type: 'standard', priority: 'medium' },
        { name: 'Create first digital piece', description: 'Complete initial artwork', type: 'standard', priority: 'high' },
        { name: 'Join art community', description: 'Connect with other digital artists', type: 'standard', priority: 'low' },
        { name: 'Build art portfolio', description: 'Create collection of best work', type: 'standard', priority: 'medium' },
        { name: 'Share art online', description: 'Post work on social platforms', type: 'standard', priority: 'low' }
      ],
      habits: [
        { name: 'Daily art practice', description: '1-2 hours of drawing/painting', frequency: 'daily', icon: '🎨' },
        { name: 'Study art tutorials', description: 'Watch technique videos', frequency: 'daily', icon: '📺' },
        { name: 'Sketch observations', description: 'Draw from life and reference', frequency: 'daily', icon: '✏️' },
        { name: 'Art community engagement', description: 'Share and get feedback', frequency: 'weekly', selectedDays: ['fri'], icon: '💬' },
        { name: 'Experiment with styles', description: 'Try new techniques and approaches', frequency: 'weekly', selectedDays: ['sat'], icon: '🎭' }
      ]
    },
    {
      id: 'photography-skills',
      icon: '📸',
      name: 'Photography Skills',
      duration: '3-6 months',
      description: 'Improve photography skills and build a portfolio.',
      taskCount: 7,
      habitCount: 4,
      category: 'creative',
      tasks: [
        { name: 'Learn camera basics', description: 'Master aperture, shutter speed, ISO', type: 'standard', priority: 'urgent' },
        { name: 'Practice composition rules', description: 'Study rule of thirds, leading lines', type: 'standard', priority: 'high' },
        { name: 'Buy photography gear', description: 'Get camera, lenses, tripod', type: 'to-buy', priority: 'medium' },
        { name: 'Find photo subjects', description: 'Identify interesting locations/themes', type: 'standard', priority: 'medium' },
        { name: 'Learn photo editing', description: 'Master Lightroom or similar software', type: 'standard', priority: 'high' },
        { name: 'Build photo portfolio', description: 'Curate best work collection', type: 'standard', priority: 'medium' },
        { name: 'Share photos online', description: 'Create Instagram or website', type: 'standard', priority: 'low' }
      ],
      habits: [
        { name: 'Daily photo taking', description: 'Capture at least 10 photos', frequency: 'daily', icon: '📸' },
        { name: 'Photo editing practice', description: 'Edit and enhance photos', frequency: 'daily', icon: '🖥️' },
        { name: 'Photography study', description: 'Study other photographers\' work', frequency: 'weekly', selectedDays: ['sun'], icon: '👁️' },
        { name: 'Share weekly favorites', description: 'Post best photos from the week', frequency: 'weekly', selectedDays: ['fri'], icon: '📱' }
      ]
    }
  ]
}

const STEP_ORDER: OnboardingStep[] = ['welcome', 'category', 'template', 'ai', 'ready']

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'welcome',
      isOnboardingActive: false,
      onboardingData: {
        selectedCategory: null,
        selectedTemplate: null,
        userName: '',
        userEmail: '',
        skipAI: false
      },

      // Actions
      setCurrentStep: (step: OnboardingStep) => set({ currentStep: step }),
      
      setSelectedCategory: (categoryId: string) => 
        set(state => ({
          onboardingData: {
            ...state.onboardingData,
            selectedCategory: categoryId,
            selectedTemplate: null // Reset template when category changes
          }
        })),
      
      setSelectedTemplate: (template: GoalTemplate) =>
        set(state => ({
          onboardingData: {
            ...state.onboardingData,
            selectedTemplate: template
          }
        })),
      
      setUserInfo: (name: string, email: string) =>
        set(state => ({
          onboardingData: {
            ...state.onboardingData,
            userName: name,
            userEmail: email
          }
        })),
      
      setSkipAI: (skip: boolean) =>
        set(state => ({
          onboardingData: {
            ...state.onboardingData,
            skipAI: skip
          }
        })),
      
      startOnboarding: () => 
        set({ 
          isOnboardingActive: true, 
          currentStep: 'welcome' 
        }),
      
      completeOnboarding: () => {
        // Mark onboarding as completed in settings
        import('./settingsStore').then(({ useSettingsStore }) => {
          useSettingsStore.getState().completeOnboarding()
        }).catch(console.warn)
        
        set({ 
          isOnboardingActive: false,
          currentStep: 'welcome' // Reset for next time
        })
      },
      
      resetOnboarding: () =>
        set({
          currentStep: 'welcome',
          isOnboardingActive: true,
          onboardingData: {
            selectedCategory: null,
            selectedTemplate: null,
            userName: '',
            userEmail: '',
            skipAI: false
          }
        }),
      
      nextStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep)
        if (currentIndex < STEP_ORDER.length - 1) {
          set({ currentStep: STEP_ORDER[currentIndex + 1] })
        }
      },
      
      previousStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep)
        if (currentIndex > 0) {
          set({ currentStep: STEP_ORDER[currentIndex - 1] })
        }
      },
      
      // Data getters
      getCategories: () => CATEGORIES,
      
      getTemplatesForCategory: (categoryId: string) => 
        TEMPLATES[categoryId] || []
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        onboardingData: state.onboardingData
      })
    }
  )
)