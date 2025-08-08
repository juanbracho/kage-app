import type { Habit } from '../types/habit'
import type { Goal } from '../types/goal'

/**
 * Get the effective color for a habit, considering goal color inheritance
 */
export function getHabitColor(habit: Habit, goals: Goal[]): string {
  // Debug logging (remove in production)
  console.log('getHabitColor debug:', {
    habitName: habit.name,
    goalId: habit.goalId,
    useGoalColor: habit.useGoalColor,
    customColor: habit.customColor,
    habitColor: habit.color,
    goalsCount: goals.length
  });

  // If habit is linked to a goal and should use goal color (default behavior)
  if (habit.goalId && habit.useGoalColor !== false) {
    const linkedGoal = goals.find(g => g.id === habit.goalId)
    if (linkedGoal && linkedGoal.color) {
      console.log('Using goal color:', linkedGoal.color, 'from goal:', linkedGoal.name);
      return linkedGoal.color
    }
    console.log('Goal not found or missing color, goalId:', habit.goalId);
  }
  
  // Use custom color if explicitly set to override goal color
  if (habit.customColor && habit.useGoalColor === false) {
    console.log('Using custom color:', habit.customColor);
    return habit.customColor
  }
  
  // Fallback to habit's original color
  const fallbackColor = habit.color || '#FF7101'; // Default to orange if no color
  console.log('Using fallback color:', fallbackColor);
  return fallbackColor
}

/**
 * Check if habit should inherit color from goal
 */
export function shouldInheritGoalColor(habit: Habit): boolean {
  return !!(habit.goalId && habit.useGoalColor !== false)
}

/**
 * Get color inheritance status for UI display
 */
export function getColorInheritanceStatus(habit: Habit, goals: Goal[]): {
  isInherited: boolean
  goalName?: string
  effectiveColor: string
} {
  const effectiveColor = getHabitColor(habit, goals)
  
  if (habit.goalId && habit.useGoalColor !== false) {
    const linkedGoal = goals.find(g => g.id === habit.goalId)
    return {
      isInherited: true,
      goalName: linkedGoal?.name,
      effectiveColor
    }
  }
  
  return {
    isInherited: false,
    effectiveColor
  }
}