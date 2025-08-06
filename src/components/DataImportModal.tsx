import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Database, Package } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useJournalStore } from '../store/journalStore';
import { useCalendarStore } from '../store/calendarStore';
import { Habit, HabitCompletion } from '../types/habit';
import { Task } from '../types/task';
import { Goal } from '../types/goal';
import { JournalEntry } from '../types/journal';
import { CalendarEvent } from '../types/calendar';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KageBackupData {
  exportInfo: {
    version: string;
    exportDate: string;
    appVersion: string;
    format: string;
    userProfile?: {
      name: string;
      email: string;
    };
    relationshipMetadata?: {
      goalTaskMap: Record<string, string[]>;
      goalHabitMap: Record<string, string[]>;
      taskTimeBlockMap: Record<string, string[]>;
      habitTimeBlockMap: Record<string, string[]>;
    };
  };
  habits?: Habit[];
  tasks?: Task[];
  goals?: Goal[];
  journalEntries?: JournalEntry[];
  calendarEvents?: CalendarEvent[];
  timeBlocks?: any[];
}

interface HabitKitData {
  habits: Array<{
    id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    archived: boolean;
    orderIndex: number;
    createdAt: string;
    isInverse: boolean;
    emoji?: string;
  }>;
  completions: Array<{
    id: string;
    date: string;
    habitId: string;
    timezoneOffsetInMinutes: number;
    amountOfCompletions: number;
    note?: string;
  }>;
}

interface ImportProgress {
  stage: 'idle' | 'selecting' | 'validating' | 'processing' | 'completed' | 'error';
  message: string;
  itemsProcessed: number;
  totalItems: number;
  importType: 'kage' | 'habitkit' | null;
  errors: string[];
}

const HABITKIT_ICON_MAP: Record<string, string> = {
  treadmill: '🏃',
  sack: '💰', 
  dumbbell: '💪',
  language: '🌐',
  terminal: '💻',
  book: '📚',
  paintbrush: '🎨',
  music: '🎵',
  camera: '📷',
  gamepad: '🎮',
  heart: '❤️',
  leaf: '🌿',
  sun: '☀️',
  moon: '🌙',
  droplet: '💧',
  fire: '🔥',
  zap: '⚡',
  star: '⭐',
  target: '🎯',
  trophy: '🏆',
  medal: '🏅',
  gift: '🎁',
  bell: '🔔',
  key: '🔑',
  gem: '💎',
  crown: '👑',
  rocket: '🚀',
  airplane: '✈️',
  car: '🚗',
  bicycle: '🚴',
  running: '🏃',
  swimming: '🏊',
  yoga: '🧘',
  meditation: '🧘‍♂️',
  sleep: '😴',
  coffee: '☕',
  tea: '🍵',
  water: '💧',
  apple: '🍎',
  carrot: '🥕',
  broccoli: '🥦',
  pill: '💊',
  thermometer: '🌡️',
  stethoscope: '🩺',
  bandage: '🩹',
  syringe: '💉',
  microscope: '🔬',
  telescope: '🔭',
  lightbulb: '💡',
  gear: '⚙️',
  wrench: '🔧',
  hammer: '🔨',
  screwdriver: '🪛',
  saw: '🪚',
  ruler: '📏',
  scissors: '✂️',
  paperclip: '📎',
  pushpin: '📌',
  bookmark: '🔖',
  label: '🏷️',
  envelope: '✉️',
  mailbox: '📫',
  package: '📦',
  box: '📦',
  archive: '🗃️',
  file: '📄',
  folder: '📁',
  notebook: '📓',
  diary: '📔',
  calendar: '📅',
  clock: '🕐',
  timer: '⏲️',
  stopwatch: '⏱️',
  hourglass: '⌛',
  alarm: '⏰',
  watch: '⌚',
  smartphone: '📱',
  computer: '💻',
  keyboard: '⌨️',
  mouse: '🖱️',
  printer: '🖨️',
  camera_flash: '📸',
  video: '📹',
  tv: '📺',
  radio: '📻',
  headphones: '🎧',
  microphone: '🎤',
  guitar: '🎸',
  piano: '🎹',
  drum: '🥁',
  trumpet: '🎺',
  violin: '🎻',
  flute: '🪈',
  saxophone: '🎷'
};

const HABITKIT_COLOR_MAP: Record<string, string> = {
  '#FF3B30': '#ef4444', // red
  '#FF9500': '#f97316', // orange  
  '#FFCC02': '#eab308', // yellow
  '#34C759': '#22c55e', // green
  '#007AFF': '#3b82f6', // blue
  '#5856D6': '#8b5cf6', // purple
  '#FF2D92': '#ec4899', // pink
  '#8E8E93': '#6b7280', // gray
};

export default function DataImportModal({ isOpen, onClose }: DataImportModalProps) {
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'idle',
    message: '',
    itemsProcessed: 0,
    totalItems: 0,
    importType: null,
    errors: []
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const habitStore = useHabitStore();
  const taskStore = useTaskStore();
  const goalStore = useGoalStore();
  const journalStore = useJournalStore();
  const calendarStore = useCalendarStore();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const detectImportType = (data: any): 'kage' | 'habitkit' | null => {
    if (data.exportInfo && data.exportInfo.format) {
      return 'kage';
    }
    if (data.habits && Array.isArray(data.habits) && data.completions && Array.isArray(data.completions)) {
      return 'habitkit';
    }
    return null;
  };

  const processKageBackup = async (data: KageBackupData) => {
    let totalItems = 0;
    let processedItems = 0;

    // Count total items including time blocks
    if (data.habits) totalItems += data.habits.length;
    if (data.tasks) totalItems += data.tasks.length;
    if (data.goals) totalItems += data.goals.length;
    if (data.journalEntries) totalItems += data.journalEntries.length;
    if (data.calendarEvents) totalItems += data.calendarEvents.length;
    if (data.timeBlocks) totalItems += data.timeBlocks.length;

    setProgress(prev => ({ 
      ...prev, 
      totalItems, 
      stage: 'processing', 
      message: 'Creating backup and validating import data...' 
    }));

    console.log('📤 Import: Starting relationship-aware import');
    console.log('📤 Import: Relationship metadata:', data.exportInfo.relationshipMetadata);
    
    // CREATE BACKUP BEFORE IMPORT
    const preImportBackup = {
      habits: habitStore.habits,
      tasks: taskStore.tasks,
      goals: goalStore.goals,
      journalEntries: journalStore.entries,
      timeBlocks: calendarStore.timeBlocks
    };
    
    console.log('📤 Import: Created pre-import backup');
    
    // Store old IDs to new IDs mapping for relationship reconstruction
    const idMapping = new Map<string, string>();
    const importSummary = {
      goals: { imported: 0, failed: 0 },
      habits: { imported: 0, failed: 0 },
      tasks: { imported: 0, failed: 0 },
      journalEntries: { imported: 0, failed: 0 },
      timeBlocks: { imported: 0, failed: 0 },
      relationships: { preserved: 0, failed: 0 }
    };

    // Validation helper
    const validateData = (item: any, type: string, requiredFields: string[]) => {
      for (const field of requiredFields) {
        if (!item[field]) {
          throw new Error(`Invalid ${type}: missing required field '${field}'`);
        }
      }
    };

    try {
      // PHASE 1: Import Goals first (no dependencies)
      if (data.goals) {
        console.log('📤 Import: Phase 1 - Importing goals');
        setProgress(prev => ({ ...prev, message: 'Importing goals...' }));
        
        for (const goal of data.goals) {
          try {
            validateData(goal, 'goal', ['id', 'name']);
            
            await new Promise(resolve => setTimeout(resolve, 10));
            const oldId = goal.id;
            const newGoal = goalStore.addGoal(goal);
            // Store ID mapping if the store generates new IDs
            if (newGoal && newGoal !== oldId) {
              idMapping.set(oldId, newGoal);
            } else {
              idMapping.set(oldId, oldId);
            }
            
            importSummary.goals.imported++;
            processedItems++;
            setProgress(prev => ({ ...prev, itemsProcessed: processedItems }));
          } catch (error) {
            console.error(`Error importing goal ${goal.name || 'unknown'}:`, error);
            importSummary.goals.failed++;
          }
        }
      }

      // PHASE 2: Import Habits (may depend on goals)
      if (data.habits) {
        console.log('📤 Import: Phase 2 - Importing habits');
        for (const habit of data.habits) {
          try {
            validateData(habit, 'habit', ['id', 'name']);
            
            await new Promise(resolve => setTimeout(resolve, 10));
            // Remove completions from habit object as addHabit expects Omit<Habit, 'completions'>
            const { completions, ...habitWithoutCompletions } = habit;
            
            // Update goalId if it exists and we have a mapping
            if (habitWithoutCompletions.goalId && idMapping.has(habitWithoutCompletions.goalId)) {
              (habitWithoutCompletions as any).goalId = idMapping.get(habitWithoutCompletions.goalId);
            }
            
            const oldId = habit.id;
            const newHabitId = habitStore.addHabit(habitWithoutCompletions);
            idMapping.set(oldId, newHabitId || oldId);
            
            // Add completions separately if they exist
            if (completions && completions.length > 0) {
              for (const completion of completions) {
                validateData(completion, 'habit completion', ['id', 'habitId', 'date']);
                // Update habitId to new ID
                const updatedCompletion = {
                  ...completion,
                  habitId: idMapping.get(completion.habitId) || completion.habitId
                };
                habitStore.addHabitCompletion(updatedCompletion);
              }
            }
            
            processedItems++;
            setProgress(prev => ({ ...prev, itemsProcessed: processedItems }));
          } catch (error) {
            console.error(`Error importing habit ${habit.name || 'unknown'}:`, error);
          }
        }
      }

      // PHASE 3: Import Tasks (may depend on goals)
      if (data.tasks) {
        console.log('📤 Import: Phase 3 - Importing tasks');
        for (const task of data.tasks) {
          try {
            validateData(task, 'task', ['id', 'name']);
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Transform task data to match store expectations
            const transformedTask = {
              ...task,
              // Update goalId if it exists and we have a mapping
              goalId: task.goalId && idMapping.has(task.goalId) ? idMapping.get(task.goalId) : task.goalId,
              // Convert subtasks from objects to strings for addTask method
              subtasks: task.subtasks?.map(subtask => {
                if (typeof subtask === 'string') return subtask;
                if (subtask && typeof subtask === 'object' && subtask.name) {
                  return subtask.name;
                }
                return String(subtask || ''); // Fallback for unexpected formats
              }).filter(name => name && name.trim() !== '') || [],
              // Ensure shoppingItems are properly formatted
              shoppingItems: task.shoppingItems?.map(item => 
                typeof item === 'string' ? { name: item, completed: false } : item
              ) || []
            };
            
            const oldId = task.id;
            const newTaskId = taskStore.addTask(transformedTask);
            idMapping.set(oldId, newTaskId || oldId);
            
            processedItems++;
            setProgress(prev => ({ ...prev, itemsProcessed: processedItems }));
          } catch (error) {
            console.error(`Error importing task ${task.name || 'unknown'}:`, error);
          }
        }
      }

      // PHASE 4: Import Journal Entries (no dependencies)
      if (data.journalEntries) {
        console.log('📤 Import: Phase 4 - Importing journal entries');
        for (const entry of data.journalEntries) {
          try {
            validateData(entry, 'journal entry', ['id', 'content']);
            
            await new Promise(resolve => setTimeout(resolve, 10));
            journalStore.addEntry(entry);
            processedItems++;
            setProgress(prev => ({ ...prev, itemsProcessed: processedItems }));
          } catch (error) {
            console.error(`Error importing journal entry ${entry.id || 'unknown'}:`, error);
          }
        }
      }

      // PHASE 5: Import Time Blocks (may depend on tasks and habits)
      if (data.timeBlocks) {
        console.log('📤 Import: Phase 5 - Importing time blocks');
        for (const block of data.timeBlocks) {
          try {
            validateData(block, 'time block', ['id', 'title']);
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Update linked item IDs if they exist and we have mappings
            const updatedBlock = { ...block };
            if (block.linkedItemId && block.linkedItemType) {
              if (block.linkedItemType === 'task' && idMapping.has(block.linkedItemId)) {
                updatedBlock.linkedItemId = idMapping.get(block.linkedItemId);
              } else if (block.linkedItemType === 'habit' && idMapping.has(block.linkedItemId)) {
                updatedBlock.linkedItemId = idMapping.get(block.linkedItemId);
              }
            }
            
            calendarStore.addTimeBlock(updatedBlock);
            processedItems++;
            setProgress(prev => ({ ...prev, itemsProcessed: processedItems }));
          } catch (error) {
            console.error(`Error importing time block ${block.title || 'unknown'}:`, error);
          }
        }
      }

      // Import legacy calendar events (for backward compatibility)
      if (data.calendarEvents) {
        console.log('📤 Import: Importing legacy calendar events');
        for (const event of data.calendarEvents) {
          try {
            validateData(event, 'calendar event', ['id', 'title']);
            
            await new Promise(resolve => setTimeout(resolve, 10));
            calendarStore.addEvent(event);
            processedItems++;
            setProgress(prev => ({ ...prev, itemsProcessed: processedItems }));
          } catch (error) {
            console.error(`Error importing calendar event ${event.title || 'unknown'}:`, error);
          }
        }
      }

      console.log('📤 Import: Completed relationship-aware import');
      console.log('📤 Import: ID mappings created:', Object.fromEntries(idMapping));
      console.log('📤 Import: Summary:', importSummary);
      
      // Validate relationships if metadata was available
      if (data.exportInfo.relationshipMetadata) {
        console.log('📤 Import: Validating relationships...');
        
        // Check goal-task relationships
        const goalTaskMeta = data.exportInfo.relationshipMetadata.goalTaskMap;
        Object.entries(goalTaskMeta).forEach(([goalId, taskIds]) => {
          const mappedGoalId = idMapping.get(goalId);
          if (mappedGoalId) {
            taskIds.forEach(taskId => {
              const mappedTaskId = idMapping.get(taskId);
              if (mappedTaskId) {
                importSummary.relationships.preserved++;
              } else {
                importSummary.relationships.failed++;
              }
            });
          }
        });
      }
      
      const totalImported = Object.values(importSummary).reduce((sum, category) => {
        if (typeof category === 'object' && 'imported' in category) {
          return sum + category.imported;
        }
        return sum;
      }, 0);
      
      const totalFailed = Object.values(importSummary).reduce((sum, category) => {
        if (typeof category === 'object' && 'failed' in category) {
          return sum + category.failed;
        }
        return sum;
      }, 0);
      
      let statusMessage = `Successfully imported ${totalImported} items`;
      if (totalFailed > 0) {
        statusMessage += ` (${totalFailed} failed)`;
      }
      if (importSummary.relationships.preserved > 0) {
        statusMessage += ` with ${importSummary.relationships.preserved} relationships preserved`;
      }
      
      setProgress(prev => ({
        ...prev,
        stage: 'completed',
        message: statusMessage
      }));

    } catch (error) {
      console.error('Error importing Kage backup:', error);
      setProgress(prev => ({
        ...prev,
        stage: 'error',
        message: 'Failed to import Kage backup',
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error']
      }));
    }
  };

  const processHabitKitData = async (data: HabitKitData) => {
    const totalItems = data.habits.length + data.completions.length;
    let processedItems = 0;

    setProgress(prev => ({ ...prev, totalItems, stage: 'processing', message: 'Converting HabitKit data...' }));

    try {
      // Import habits
      for (const habitKitHabit of data.habits) {
        if (habitKitHabit.archived) continue;

        const habit: Omit<Habit, 'completions'> = {
          id: habitKitHabit.id,
          name: habitKitHabit.name,
          description: habitKitHabit.description || '',
          icon: habitKitHabit.emoji || HABITKIT_ICON_MAP[habitKitHabit.icon] || '⭐',
          color: HABITKIT_COLOR_MAP[habitKitHabit.color] || habitKitHabit.color || '#3b82f6',
          measurementType: 'simple',
          frequency: 'daily',
          createdAt: habitKitHabit.createdAt,
          updatedAt: new Date().toISOString(),
          streak: 0
        };

        await new Promise(resolve => setTimeout(resolve, 10));
        habitStore.addHabit(habit);
        processedItems++;
        setProgress(prev => ({ ...prev, itemsProcessed: processedItems }));
      }

      // Import completions
      const completionsByHabit = new Map<string, HabitCompletion[]>();
      
      for (const completion of data.completions) {
        if (!completionsByHabit.has(completion.habitId)) {
          completionsByHabit.set(completion.habitId, []);
        }

        // Convert HabitKit date to local date
        const parseDate = (dateStr: string) => {
          // Handle both ISO timestamps and date-only strings
          const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00.000Z');
          return isNaN(date.getTime()) ? new Date() : date;
        };
        
        let localDateString = completion.date;
        if (completion.timezoneOffsetInMinutes) {
          const utcDate = parseDate(completion.date);
          const localDate = new Date(utcDate.getTime() - (completion.timezoneOffsetInMinutes * 60000));
          localDateString = localDate.toISOString().split('T')[0];
        }

        const habitCompletion: HabitCompletion = {
          id: completion.id,
          habitId: completion.habitId,
          date: localDateString,
          completed: completion.amountOfCompletions > 0,
          completedAt: parseDate(completion.date).toISOString(),
          value: completion.amountOfCompletions || 1
        };

        completionsByHabit.get(completion.habitId)!.push(habitCompletion);
        processedItems++;
        setProgress(prev => ({ ...prev, itemsProcessed: processedItems }));
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      // Add completions to habits
      for (const [habitId, completions] of completionsByHabit) {
        for (const completion of completions) {
          habitStore.addHabitCompletion(completion);
        }
      }

      setProgress(prev => ({
        ...prev,
        stage: 'completed',
        message: `Successfully imported ${data.habits.filter(h => !h.archived).length} habits with ${data.completions.length} completions from HabitKit`
      }));

    } catch (error) {
      console.error('Error importing HabitKit data:', error);
      setProgress(prev => ({
        ...prev,
        stage: 'error',
        message: 'Failed to import HabitKit data',
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error']
      }));
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProgress({
      stage: 'validating',
      message: 'Validating file...',
      itemsProcessed: 0,
      totalItems: 0,
      importType: null,
      errors: []
    });

    try {
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);
      
      const importType = detectImportType(data);
      if (!importType) {
        setProgress(prev => ({
          ...prev,
          stage: 'error',
          message: 'Unsupported file format. Please select a valid Kage backup or HabitKit export file.',
          errors: ['File format not recognized']
        }));
        return;
      }

      setProgress(prev => ({ ...prev, importType }));

      if (importType === 'kage') {
        await processKageBackup(data as KageBackupData);
      } else if (importType === 'habitkit') {
        await processHabitKitData(data as HabitKitData);
      }

    } catch (error) {
      console.error('Error processing file:', error);
      setProgress(prev => ({
        ...prev,
        stage: 'error',
        message: 'Failed to process file. Please ensure it\'s a valid JSON file.',
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error']
      }));
    }

    // Reset file input
    event.target.value = '';
  };

  const resetProgress = () => {
    setProgress({
      stage: 'idle',
      message: '',
      itemsProcessed: 0,
      totalItems: 0,
      importType: null,
      errors: []
    });
  };

  const handleClose = () => {
    resetProgress();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Import Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {progress.stage === 'idle' && (
            <div className="text-center">
              <div className="mb-6">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Import your data from Kage backups or HabitKit exports
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: Kage Full Backup, Kage Habits Only, HabitKit JSON
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Kage Backup</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full data restoration</p>
                </div>
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Package className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">HabitKit</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Habits migration</p>
                </div>
              </div>

              <button
                onClick={handleFileSelect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Select File to Import
              </button>
            </div>
          )}

          {(progress.stage === 'validating' || progress.stage === 'processing') && (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{progress.message}</p>
                {progress.importType && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detected: {progress.importType === 'kage' ? 'Kage Backup' : 'HabitKit Export'}
                  </p>
                )}
              </div>
              
              {progress.totalItems > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.itemsProcessed / progress.totalItems) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {progress.itemsProcessed} of {progress.totalItems} items processed
                  </p>
                </div>
              )}
            </div>
          )}

          {progress.stage === 'completed' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Import Successful!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{progress.message}</p>
              <button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {progress.stage === 'error' && (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Import Failed</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{progress.message}</p>
              
              {progress.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-left">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Errors:</p>
                  {progress.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 dark:text-red-300">• {error}</p>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={resetProgress}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}