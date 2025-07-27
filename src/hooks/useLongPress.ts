import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number; // milliseconds
}

export const useLongPress = ({
  onLongPress,
  onClick,
  threshold = 500
}: UseLongPressOptions) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const target = useRef<EventTarget>();

  const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (event.target) {
      target.current = event.target;
    }
    setLongPressTriggered(false);
    
    timeout.current = setTimeout(() => {
      onLongPress();
      setLongPressTriggered(true);
    }, threshold);
  }, [onLongPress, threshold]);

  const clear = useCallback((event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
    timeout.current && clearTimeout(timeout.current);
    
    if (shouldTriggerClick && !longPressTriggered && onClick) {
      // Only trigger click if the event target is the same (prevents issues with event bubbling)
      if (!target.current || event.target === target.current) {
        onClick();
      }
    }
  }, [onClick, longPressTriggered]);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e)
  };
};