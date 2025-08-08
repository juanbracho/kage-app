import { useOnboardingStore } from '../../store/onboardingStore'

export default function ReadyStep() {
  const { onboardingData } = useOnboardingStore()
  const selectedTemplate = onboardingData.selectedTemplate

  return (
    <div className="h-full bg-gradient-to-br from-orange-500 to-orange-400 text-white flex flex-col justify-center items-center text-center px-10 pt-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
      
      <div className="relative z-10 max-w-md">
        {/* Success Icon with bounce animation */}
        <div className="text-8xl mb-8 animate-bounce">
          🎉
        </div>
        
        {/* Ready Title */}
        <h2 className="text-4xl font-bold mb-4">You're All Set!</h2>
        
        {/* Ready Subtitle */}
        <p className="text-lg opacity-90 mb-10 leading-relaxed">
          {selectedTemplate 
            ? `Your "${selectedTemplate.name}" goal is ready. Let's start building the habits that will make it happen.`
            : "You're ready to start achieving your goals with Kage!"
          }
        </p>
        
        {/* Ready Stats */}
        <div className="grid grid-cols-3 gap-5 mb-12">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">1</div>
            <div className="text-xs opacity-80 uppercase tracking-wide">Goal Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {selectedTemplate?.taskCount || 3}
            </div>
            <div className="text-xs opacity-80 uppercase tracking-wide">Tasks Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {selectedTemplate?.habitCount || 2}
            </div>
            <div className="text-xs opacity-80 uppercase tracking-wide">Habits Suggested</div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}