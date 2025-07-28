export default function AIStep() {
  return (
    <div className="h-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex flex-col justify-center items-center text-center px-10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
      
      <div className="relative z-10 max-w-md">
        {/* AI Icon with pulse animation */}
        <div className="w-32 h-32 bg-white/10 rounded-3xl flex items-center justify-center text-6xl mb-8 mx-auto animate-pulse">
          🤖
        </div>
        
        {/* AI Title */}
        <h2 className="text-3xl font-bold mb-4">Meet Your AI Assistant</h2>
        
        {/* AI Description */}
        <p className="text-base opacity-90 mb-8 leading-relaxed">
          Kage's AI helps you stay motivated, provides insights, and suggests improvements to achieve your goals faster.
        </p>
        
        {/* AI Features */}
        <div className="space-y-4 mb-10 text-left">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <span className="text-xl flex-shrink-0">📊</span>
            <span className="text-sm font-medium">Smart insights about your productivity patterns</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <span className="text-xl flex-shrink-0">💡</span>
            <span className="text-sm font-medium">Personalized suggestions for habits and tasks</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <span className="text-xl flex-shrink-0">💬</span>
            <span className="text-sm font-medium">AI chat for motivation and strategy advice</span>
          </div>
        </div>
        
        {/* Premium Upgrade Offer */}
        <div className="bg-white/10 rounded-2xl p-5 mb-8">
          <p className="text-sm opacity-90 mb-3">Available with Kage Premium</p>
          <p className="text-base font-semibold text-yellow-300">
            7-day free trial • $9.99/month
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}