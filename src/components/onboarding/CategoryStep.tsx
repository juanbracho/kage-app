import { useOnboardingStore } from '../../store/onboardingStore'

export default function CategoryStep() {
  const { getCategories, setSelectedCategory, onboardingData } = useOnboardingStore()
  const categories = getCategories()

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  return (
    <div className="h-full bg-gradient-to-br from-purple-600 to-purple-500 text-white px-5 pt-20 pb-10 overflow-y-auto">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Choose Your Focus Area</h2>
          <p className="text-base opacity-90 max-w-lg mx-auto leading-relaxed">
            Which area of your life would you like to improve first? We'll help you create your first goal.
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`
                p-6 rounded-2xl border-2 transition-all duration-300 text-center relative overflow-hidden
                ${onboardingData.selectedCategory === category.id
                  ? 'border-white/40 bg-white/15 shadow-lg transform -translate-y-1'
                  : 'border-transparent bg-white/10 hover:bg-white/15 hover:border-white/30 hover:-translate-y-1'
                }
              `}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-3 translate-x-3 transition-all duration-300" />
              
              <div className="relative z-10">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-base font-semibold mb-1">{category.name}</h3>
                <p className="text-xs opacity-75">{category.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}