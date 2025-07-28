import { useOnboardingStore } from '../../store/onboardingStore'

export default function TemplateStep() {
  const { 
    getTemplatesForCategory, 
    setSelectedTemplate, 
    onboardingData 
  } = useOnboardingStore()
  
  const templates = getTemplatesForCategory(onboardingData.selectedCategory || '')

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
  }

  return (
    <div className="h-full bg-gradient-to-br from-green-500 to-teal-400 text-white px-5 py-10 overflow-y-auto">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Choose Your First Goal</h2>
          <p className="text-base opacity-90 max-w-lg mx-auto leading-relaxed">
            Pick a proven template to get started quickly, or create a custom goal later.
          </p>
        </div>
        
        {/* Templates Grid */}
        <div className="space-y-4 mb-8">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`
                w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden
                ${onboardingData.selectedTemplate?.id === template.id
                  ? 'border-white/40 bg-white/15 shadow-lg transform -translate-y-1'
                  : 'border-transparent bg-white/10 hover:bg-white/15 hover:border-white/30 hover:-translate-y-1'
                }
              `}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-4 translate-x-4" />
              
              <div className="relative z-10">
                {/* Template Header */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{template.name}</h3>
                    <p className="text-xs opacity-75">{template.duration}</p>
                  </div>
                </div>
                
                {/* Template Description */}
                <p className="text-sm opacity-90 mb-3 leading-relaxed">
                  {template.description}
                </p>
                
                {/* Template Stats */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">✅</span>
                    <span className="text-xs opacity-80">{template.taskCount} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🔄</span>
                    <span className="text-xs opacity-80">{template.habitCount} habits</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}