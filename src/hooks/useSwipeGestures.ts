import { useEffect, useState } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventDefaultScroll?: boolean
}

export function useSwipeGestures(options: SwipeGestureOptions) {
  const [startX, setStartX] = useState<number | null>(null)
  const [startY, setStartY] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultScroll = false
  } = options

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setStartX(e.touches[0].clientX)
      setStartY(e.touches[0].clientY)
      setStartTime(Date.now())
      
      if (preventDefaultScroll) {
        e.preventDefault()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (preventDefaultScroll) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY || !startTime) return

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const endTime = Date.now()
      
      const diffX = startX - endX
      const diffY = startY - endY
      const timeDiff = endTime - startTime

      // Only register swipe if it's fast enough (< 300ms) and meets threshold
      if (timeDiff > 300) {
        setStartX(null)
        setStartY(null)
        setStartTime(null)
        return
      }

      // Determine if this is a horizontal or vertical swipe
      const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY)
      
      if (isHorizontalSwipe && Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swipe left (finger moved left)
          onSwipeLeft?.()
        } else {
          // Swipe right (finger moved right)
          onSwipeRight?.()
        }
      } else if (!isHorizontalSwipe && Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          // Swipe up (finger moved up)
          onSwipeUp?.()
        } else {
          // Swipe down (finger moved down)
          onSwipeDown?.()
        }
      }

      setStartX(null)
      setStartY(null)
      setStartTime(null)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: !preventDefaultScroll })
    document.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultScroll })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startX, startY, startTime, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, preventDefaultScroll])
}

// Hook specifically for back gestures (swipe from left edge)
export function useSwipeBack(onSwipeBack: () => void, enabled: boolean = true) {
  const [startX, setStartX] = useState<number | null>(null)
  const [startY, setStartY] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      // Only trigger if swipe starts from left edge (within 30px)
      if (touch.clientX < 30) {
        setStartX(touch.clientX)
        setStartY(touch.clientY)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      
      const diffX = endX - startX
      const diffY = Math.abs(endY - startY)
      
      // Swipe right from left edge with minimal vertical movement
      if (diffX > 100 && diffY < 50) {
        onSwipeBack()
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
  }, [startX, startY, onSwipeBack, enabled])
}