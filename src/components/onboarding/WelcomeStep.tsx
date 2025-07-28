export default function WelcomeStep() {
  return (
    <div className="h-full bg-gradient-to-br from-orange-500 to-orange-400 text-white flex flex-col justify-center items-center text-center px-10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
      
      <div className="relative z-10 max-w-md">
        {/* App Logo with floating animation */}
        <div className="text-8xl mb-6 animate-bounce">
          🏮
        </div>
        
        {/* Welcome Title */}
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Welcome to Kage
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg opacity-90 mb-12 leading-relaxed">
          Turn your goals into reality with the productivity app that connects everything you do to what matters most.
        </p>
        
        {/* Feature Highlights */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-sm font-semibold opacity-90">Goal-Centric</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm font-semibold opacity-90">Smart Tracking</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤖</div>
            <div className="text-sm font-semibold opacity-90">AI-Powered</div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}