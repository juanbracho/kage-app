import { useEffect, useState } from 'react'
import { useOnboardingStore } from '../../store/onboardingStore'
import WelcomeStep from './WelcomeStep'
import CategoryStep from './CategoryStep'
import TemplateStep from './TemplateStep'
import AIStep from './AIStep'
import ReadyStep from './ReadyStep'

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { 
    currentStep, 
    nextStep, 
    previousStep, 
    completeOnboarding,
    onboardingData 
  } = useOnboardingStore()
  
  const [startX, setStartX] = useState<number | null>(null)
  const [startY, setStartY] = useState<number | null>(null)

  // Handle swipe gestures for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setStartX(e.touches[0].clientX)
      setStartY(e.touches[0].clientY)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const diffX = startX - endX
      const diffY = startY - endY

      // Only trigger if horizontal swipe is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left - next step
          handleNext()
        } else if (diffX < 0) {
          // Swipe right - previous step
          handlePrevious()
        }
      }

      setStartX(null)
      setStartY(null)
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startX, startY])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'Escape') {
        handleSkip()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNext = () => {
    // Validation logic
    if (currentStep === 'category' && !onboardingData.selectedCategory) {
      alert('Please select a category first!')
      return
    }
    
    if (currentStep === 'template' && !onboardingData.selectedTemplate) {
      alert('Please choose a goal template!')
      return
    }
    
    if (currentStep === 'ready') {
      handleComplete()
    } else {
      nextStep()
    }
  }

  const handlePrevious = () => {
    if (currentStep !== 'welcome') {
      previousStep()
    }
  }

  const handleSkip = () => {
    if (confirm('Skip onboarding and go to dashboard?')) {
      handleComplete()
    }
  }

  const handleComplete = () => {
    completeOnboarding()
    onComplete()
  }

  const getStepIndicatorDots = () => {
    const steps = ['welcome', 'category', 'template', 'ai', 'ready']
    const currentIndex = steps.indexOf(currentStep)
    
    return steps.map((_, index) => (
      <div
        key={index}
        className={`h-2 rounded-full transition-all duration-300 ${
          index === currentIndex
            ? 'w-6 bg-white'
            : 'w-2 bg-white/30'
        }`}
      />
    ))
  }

  const canGoBack = currentStep !== 'welcome'
  const isLastStep = currentStep === 'ready'

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Step Indicator */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {getStepIndicatorDots()}
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-12 right-5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors z-10"
      >
        Skip
      </button>

      {/* Step Content */}
      <div className="h-full">
        {currentStep === 'welcome' && <WelcomeStep />}
        {currentStep === 'category' && <CategoryStep />}
        {currentStep === 'template' && <TemplateStep />}
        {currentStep === 'ai' && <AIStep />}
        {currentStep === 'ready' && <ReadyStep />}
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        {canGoBack && (
          <button
            onClick={handlePrevious}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors border border-white/30"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          {isLastStep ? 'Start Using Kage' : 
           currentStep === 'category' && !onboardingData.selectedCategory ? 'Choose Category' :
           currentStep === 'template' && !onboardingData.selectedTemplate ? 'Choose Template' :
           currentStep === 'template' ? 'Create Goal' :
           currentStep === 'ai' ? 'Continue Free' :
           'Continue'}
        </button>
      </div>
    </div>
  )
}