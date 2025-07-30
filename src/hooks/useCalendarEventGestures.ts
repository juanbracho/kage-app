import { useCallback, useRef } from 'react';
import { CalendarEvent } from '../types/calendar';

interface CalendarEventGesturesOptions {
  onTap: (event: CalendarEvent) => void;           // Toggle completion
  onLongPress: (event: CalendarEvent) => void;     // Open edit modal
  onSwipeLeft: (event: CalendarEvent) => void;     // Delete with confirmation
  threshold?: number;                              // Long press threshold in ms
  swipeThreshold?: number;                         // Swipe distance threshold in px
}

interface GestureState {
  isPressed: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  longPressTriggered: boolean;
  swipeTriggered: boolean;
  startTime: number;
}

export const useCalendarEventGestures = ({
  onTap,
  onLongPress,
  onSwipeLeft,
  threshold = 600, // Long press threshold - reduced for better responsiveness
  swipeThreshold = 80
}: CalendarEventGesturesOptions) => {
  // Use refs for immediate state access without closure issues
  const gestureStateRef = useRef<GestureState>({
    isPressed: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    longPressTriggered: false,
    swipeTriggered: false,
    startTime: 0
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const eventRef = useRef<CalendarEvent | null>(null);

  const clearLongPressTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const resetGestureState = useCallback(() => {
    console.log('🔄 Resetting gesture state');
    
    // Clear timeout if it exists
    clearLongPressTimeout();
    
    gestureStateRef.current = {
      isPressed: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      longPressTriggered: false,
      swipeTriggered: false,
      startTime: 0
    };
    eventRef.current = null;
  }, [clearLongPressTimeout]);

  const getEventHandlers = useCallback((event: CalendarEvent) => {
    const handleStart = (clientX: number, clientY: number) => {
      const now = Date.now();
      console.log('🟢 Gesture Start:', event.title, `at ${now}`);
      
      // Store event reference first
      eventRef.current = event;
      
      // Update gesture state
      gestureStateRef.current = {
        isPressed: true,
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        currentY: clientY,
        longPressTriggered: false,
        swipeTriggered: false,
        startTime: now
      };
      
      console.log('🟢 Gesture State Set:', gestureStateRef.current);

      // Start long press timer
      timeoutRef.current = setTimeout(() => {
        // Check if gesture is still valid (not moved too much)
        const currentState = gestureStateRef.current;
        const deltaX = Math.abs(currentState.currentX - currentState.startX);
        const deltaY = Math.abs(currentState.currentY - currentState.startY);
        
        if (currentState.isPressed && deltaX < 15 && deltaY < 15 && !currentState.swipeTriggered) {
          console.log('🔴 Long Press Triggered:', event.title);
          gestureStateRef.current.longPressTriggered = true;
          onLongPress(event);
        } else {
          console.log('🔴 Long Press Cancelled - Movement too much or not pressed:', {
            isPressed: currentState.isPressed,
            deltaX,
            deltaY,
            swipeTriggered: currentState.swipeTriggered
          });
        }
      }, threshold);
    };

    const handleMove = (clientX: number, clientY: number) => {
      const currentState = gestureStateRef.current;
      if (!currentState.isPressed) return;

      // Update current position
      gestureStateRef.current.currentX = clientX;
      gestureStateRef.current.currentY = clientY;

      const deltaX = clientX - currentState.startX;
      const deltaY = Math.abs(clientY - currentState.startY);

      // If movement is too much, cancel long press
      if ((Math.abs(deltaX) > 15 || deltaY > 15) && timeoutRef.current) {
        console.log('🔴 Long Press Cancelled due to movement:', { deltaX: Math.abs(deltaX), deltaY });
        clearLongPressTimeout();
      }

      // If vertical movement is too much, cancel swipe
      if (deltaY > 30) {
        return;
      }

      // Visual feedback for swipe progress
      const element = document.elementFromPoint(clientX, clientY) as HTMLElement;
      if (element && deltaX < -20) {
        element.style.transform = `translateX(${Math.max(deltaX, -100)}px)`;
        element.style.opacity = `${Math.max(0.5, 1 + deltaX / 200)}`;
      }

      // Check for left swipe
      if (deltaX < -swipeThreshold && !currentState.swipeTriggered && !currentState.longPressTriggered) {
        console.log('↩️ Swipe Left Triggered:', event.title);
        gestureStateRef.current.swipeTriggered = true;
        clearLongPressTimeout();
        onSwipeLeft(event);
      }
    };

    const handleEnd = () => {
      const currentState = gestureStateRef.current;
      const { longPressTriggered, swipeTriggered, startTime, isPressed } = currentState;
      const currentEvent = eventRef.current; // Store reference before reset
      const currentTime = Date.now();
      const duration = startTime > 0 ? currentTime - startTime : 0;
      
      console.log('🔴 Gesture End:', {
        event: currentEvent?.title || 'NO EVENT',
        duration: `${duration}ms`,
        startTime,
        currentTime,
        isPressed,
        longPress: longPressTriggered,
        swipe: swipeTriggered
      });
      
      clearLongPressTimeout();
      
      // Reset visual feedback
      const element = document.querySelector('[style*="translateX"]') as HTMLElement;
      if (element) {
        element.style.transform = '';
        element.style.opacity = '';
      }

      // Don't process if the gesture wasn't properly started
      if (!currentEvent || !isPressed || startTime === 0) {
        console.log('❌ Invalid gesture state - no event, not pressed, or no start time');
        resetGestureState();
        return;
      }

      // Check for reasonable duration (between 10ms and 5 seconds)
      if (duration < 10 || duration > 5000) {
        console.log('❌ Duration out of reasonable range:', duration + 'ms');
        resetGestureState();
        return;
      }

      // Process the gesture based on what was triggered
      if (swipeTriggered) {
        console.log('↩️ Swipe Completed:', currentEvent.title);
        // onSwipeLeft already called during move
      } else if (longPressTriggered) {
        console.log('🔴 Long Press Completed:', currentEvent.title);
        // onLongPress already called during timeout
      } else if (duration < threshold) {
        console.log('👆 Tap Triggered:', currentEvent.title, `(${duration}ms)`);
        onTap(currentEvent);
      } else {
        console.log('❌ No gesture recognized:', currentEvent.title, `(${duration}ms) - exceeded threshold: ${threshold}ms`);
      }

      resetGestureState();
    };

    return {
      // Mouse events
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
      },
      onMouseMove: (e: React.MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      },
      onMouseUp: handleEnd,
      onMouseLeave: handleEnd,

      // Touch events
      onTouchStart: (e: React.TouchEvent) => {
        // Remove preventDefault to avoid passive listener errors
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      },
      onTouchMove: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      },
      onTouchEnd: handleEnd,
      onTouchCancel: handleEnd
    };
  }, [onTap, onLongPress, onSwipeLeft, threshold, swipeThreshold, clearLongPressTimeout, resetGestureState]);

  return {
    getEventHandlers,
    resetGestureState
  };
};