import { useCallback, useRef, useState, useEffect } from 'react';

interface SwipeGestureConfig {
  onSwipeLeft?: () => void;      // Custom left swipe action
  onSwipeRight?: () => void;     // Custom right swipe action  
  onSwipeUp?: () => void;        // Creation modal or custom up action
  onSwipeDown?: () => void;      // Modal dismiss/minimize
  threshold?: number;            // Minimum distance (default: 50px)
  preventVertical?: boolean;     // Block during horizontal swipes
  preventHorizontal?: boolean;   // Block during vertical swipes
  disabled?: boolean;            // Temporarily disable gestures
}

interface SwipeState {
  startX: number | null;
  startY: number | null;
  startTime: number | null;
  isScrolling: boolean;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventVertical = false,
  preventHorizontal = false,
  disabled = false
}: SwipeGestureConfig) => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: null,
    startY: null,
    startTime: null,
    isScrolling: false
  });

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Detect if user is scrolling to prevent accidental swipe triggers
  const handleScroll = useCallback(() => {
    setSwipeState(prev => ({ ...prev, isScrolling: true }));
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setSwipeState(prev => ({ ...prev, isScrolling: false }));
    }, 150);
  }, []);

  useEffect(() => {
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;

    const touch = event.touches[0];
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isScrolling: false
    });
  }, [disabled]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (disabled || swipeState.isScrolling) return;
    
    const { startX, startY, startTime } = swipeState;
    
    if (startX === null || startY === null || startTime === null) return;

    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const diffX = startX - endX;
    const diffY = startY - endY;
    const diffTime = endTime - startTime;
    
    // Ignore very slow gestures (> 1 second) - likely accidental
    if (diffTime > 1000) {
      setSwipeState({ startX: null, startY: null, startTime: null, isScrolling: false });
      return;
    }

    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);
    
    // Determine swipe direction based on dominant axis
    const isHorizontalSwipe = absDiffX > absDiffY;
    const isVerticalSwipe = absDiffY > absDiffX;
    
    // Check if gesture meets threshold requirements
    const meetsThreshold = Math.max(absDiffX, absDiffY) > threshold;
    
    if (!meetsThreshold) {
      setSwipeState({ startX: null, startY: null, startTime: null, isScrolling: false });
      return;
    }

    // Handle horizontal swipes
    if (isHorizontalSwipe && !preventHorizontal) {
      if (diffX > 0 && onSwipeLeft) {
        event.preventDefault();
        onSwipeLeft();
      } else if (diffX < 0 && onSwipeRight) {
        event.preventDefault();
        onSwipeRight();
      }
    }
    
    // Handle vertical swipes
    if (isVerticalSwipe && !preventVertical) {
      if (diffY > 0 && onSwipeUp) {
        event.preventDefault();
        onSwipeUp();
      } else if (diffY < 0 && onSwipeDown) {
        event.preventDefault();
        onSwipeDown();
      }
    }

    // Reset swipe state
    setSwipeState({ startX: null, startY: null, startTime: null, isScrolling: false });
  }, [
    disabled,
    swipeState,
    threshold,
    preventHorizontal,
    preventVertical,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  ]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (disabled || swipeState.startX === null || swipeState.startY === null) return;

    const touch = event.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    const diffX = Math.abs(swipeState.startX - currentX);
    const diffY = Math.abs(swipeState.startY - currentY);
    
    // If we detect significant movement in the prevention direction, cancel the gesture
    if (preventHorizontal && diffX > 10) {
      setSwipeState({ startX: null, startY: null, startTime: null, isScrolling: false });
      return;
    }
    
    if (preventVertical && diffY > 10) {
      setSwipeState({ startX: null, startY: null, startTime: null, isScrolling: false });
      return;
    }
  }, [disabled, swipeState, preventHorizontal, preventVertical]);

  // Mouse event handlers for desktop testing
  const [mouseState, setMouseState] = useState<{
    isMouseDown: boolean;
    startX: number | null;
    startY: number | null;
  }>({
    isMouseDown: false,
    startX: null,
    startY: null
  });

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    setMouseState({
      isMouseDown: true,
      startX: event.clientX,
      startY: event.clientY
    });
  }, [disabled]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (disabled || !mouseState.isMouseDown) return;
    
    const { startX, startY } = mouseState;
    if (startX === null || startY === null) return;

    const diffX = startX - event.clientX;
    const diffY = startY - event.clientY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);
    
    const isHorizontalSwipe = absDiffX > absDiffY;
    const isVerticalSwipe = absDiffY > absDiffX;
    const meetsThreshold = Math.max(absDiffX, absDiffY) > threshold;
    
    if (meetsThreshold) {
      if (isHorizontalSwipe && !preventHorizontal) {
        if (diffX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (diffX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
      
      if (isVerticalSwipe && !preventVertical) {
        if (diffY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (diffY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    setMouseState({
      isMouseDown: false,
      startX: null,
      startY: null
    });
  }, [
    disabled,
    mouseState,
    threshold,
    preventHorizontal,
    preventVertical,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  ]);

  const handleMouseLeave = useCallback(() => {
    setMouseState({
      isMouseDown: false,
      startX: null,
      startY: null
    });
  }, []);

  // Return event handlers object
  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
  };
};

// Helper hook for common gesture patterns
// Modal swipe utility function - swipe up to close modals
export const useModalSwipe = (onClose: () => void, disabled = false) => {
  return useSwipeGesture({
    onSwipeUp: onClose,
    threshold: 40,  // Reduced from 75px for better sensitivity
    preventHorizontal: true,
    disabled
  });
};

// REMOVED: Navigation swipe functionality
// Page navigation is now handled exclusively through bottom tab bar
// This function has been removed to prevent accidental page swipes
// 
// export const useNavigationSwipe = (...) => { ... } [DEPRECATED]

// Creation swipe utility function - swipe up to create new items
export const usePageCreationSwipe = (onCreate: () => void, disabled = false) => {
  return useSwipeGesture({
    onSwipeUp: onCreate,
    threshold: 60,  // Slightly higher threshold to avoid conflicts with scrolling
    preventHorizontal: true,
    disabled
  });
};