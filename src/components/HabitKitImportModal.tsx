import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useModalSwipe } from '../hooks/useSwipeGesture';
import { Habit, HabitCompletion } from '../types/habit';

interface HabitKitImportModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  stage: 'idle' | 'validating' | 'processing' | 'completed' | 'error';
  message: string;
  habitsProcessed: number;
  completionsProcessed: number;
  totalHabits: number;
  totalCompletions: number;
  errors: string[];
}

const HABITKIT_ICON_MAP: Record<string, string> = {
  treadmill: '🏃',
  sack: '💰', 
  dumbbell: '💪',
  language: '🌐',
  terminal: '💻',
  book: '📚',
  apple: '🍎',
  house: '🏠',
  default: '✅'
};

const HABITKIT_COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  orange: '#f97316', 
  amber: '#f59e0b',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  default: '#64748b'
};

export default function HabitKitImportModal({ isOpen, onClose }: HabitKitImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'idle',
    message: 'Select a HabitKit export file to begin',
    habitsProcessed: 0,
    completionsProcessed: 0,
    totalHabits: 0,
    totalCompletions: 0,
    errors: []
  });

  const { addHabit, addHabitCompletion } = useHabitStore();
  const swipeHandlers = useModalSwipe(onClose, !isOpen);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().includes('.json')) {
        setProgress({
          ...progress,
          stage: 'error',
          message: 'Please select a JSON file',
          errors: ['File must be a JSON export from HabitKit']
        });
        return;
      }
      setSelectedFile(file);
      setProgress({
        ...progress,
        stage: 'idle',
        message: `Ready to import: ${file.name}`,
        errors: []
      });
    }
  };

  const validateHabitKitData = (data: any): HabitKitData => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON format');
    }

    if (!Array.isArray(data.habits)) {
      throw new Error('Missing or invalid habits array');
    }

    if (!Array.isArray(data.completions)) {
      throw new Error('Missing or invalid completions array');
    }

    // Validate habits structure
    for (const habit of data.habits) {
      if (!habit.id || !habit.name || typeof habit.name !== 'string') {
        throw new Error(`Invalid habit structure: missing id or name`);
      }
    }

    // Validate completions structure
    for (const completion of data.completions) {
      if (!completion.id || !completion.habitId || !completion.date) {
        throw new Error(`Invalid completion structure: missing required fields`);
      }
    }

    return data as HabitKitData;
  };

  const mapHabitKitToKage = (habitKitHabit: HabitKitData['habits'][0]): Omit<Habit, 'completions'> => {
    const now = new Date().toISOString();
    
    return {
      id: habitKitHabit.id,
      name: habitKitHabit.name,
      description: habitKitHabit.description || undefined,
      icon: HABITKIT_ICON_MAP[habitKitHabit.icon] || HABITKIT_ICON_MAP.default,
      color: HABITKIT_COLOR_MAP[habitKitHabit.color] || HABITKIT_COLOR_MAP.default,
      measurementType: 'simple' as const,
      frequency: 'daily' as const,
      createdAt: habitKitHabit.createdAt,
      updatedAt: now,
      streak: 0,
      completions: []
    };
  };

  const mapCompletionToKage = (completion: HabitKitData['completions'][0]): HabitCompletion => {
    const date = new Date(completion.date);
    const dateString = date.toISOString().split('T')[0];
    
    return {
      id: completion.id,
      habitId: completion.habitId,
      date: dateString,
      completed: completion.amountOfCompletions > 0,
      completedAt: completion.date,
      value: completion.amountOfCompletions,
      notes: completion.note || undefined
    };
  };

  const processImport = async () => {
    if (!selectedFile) return;

    try {
      setProgress({
        stage: 'validating',
        message: 'Validating file format...',
        habitsProcessed: 0,
        completionsProcessed: 0,
        totalHabits: 0,
        totalCompletions: 0,
        errors: []
      });

      const fileContent = await selectedFile.text();
      const rawData = JSON.parse(fileContent);
      const habitKitData = validateHabitKitData(rawData);

      const { habits, completions } = habitKitData;
      const activeHabits = habits.filter(h => !h.archived);

      setProgress(prev => ({
        ...prev,
        stage: 'processing',
        message: 'Importing habits and completions...',
        totalHabits: activeHabits.length,
        totalCompletions: completions.length
      }));

      const errors: string[] = [];
      let habitsProcessed = 0;
      let completionsProcessed = 0;

      // Import active habits
      for (const habitKitHabit of activeHabits) {
        try {
          const kageHabit = mapHabitKitToKage(habitKitHabit);
          addHabit(kageHabit);
          habitsProcessed++;
          
          setProgress(prev => ({
            ...prev,
            habitsProcessed,
            message: `Imported habit: ${kageHabit.name}`
          }));
          
          // Small delay for UI feedback
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          errors.push(`Failed to import habit "${habitKitHabit.name}": ${error}`);
        }
      }

      // Import completions for active habits
      const activeHabitIds = new Set(activeHabits.map(h => h.id));
      const relevantCompletions = completions.filter(c => activeHabitIds.has(c.habitId));

      for (const completion of relevantCompletions) {
        try {
          const kageCompletion = mapCompletionToKage(completion);
          addHabitCompletion(kageCompletion);
          completionsProcessed++;
          
          if (completionsProcessed % 10 === 0) {
            setProgress(prev => ({
              ...prev,
              completionsProcessed,
              message: `Imported ${completionsProcessed} completions...`
            }));
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (error) {
          errors.push(`Failed to import completion: ${error}`);
        }
      }

      setProgress({
        stage: 'completed',
        message: `Import completed! ${habitsProcessed} habits and ${completionsProcessed} completions imported.`,
        habitsProcessed,
        completionsProcessed,
        totalHabits: activeHabits.length,
        totalCompletions: relevantCompletions.length,
        errors
      });

    } catch (error) {
      setProgress({
        stage: 'error',
        message: 'Import failed',
        habitsProcessed: 0,
        completionsProcessed: 0,
        totalHabits: 0,
        totalCompletions: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setProgress({
      stage: 'idle',
      message: 'Select a HabitKit export file to begin',
      habitsProcessed: 0,
      completionsProcessed: 0,
      totalHabits: 0,
      totalCompletions: 0,
      errors: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProcessing = progress.stage === 'validating' || progress.stage === 'processing';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        {...swipeHandlers}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Import from HabitKit
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* File Selection */}
          {progress.stage === 'idle' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Import your habits and completion history from HabitKit. Select your exported JSON file to begin.
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="accent-bg-500 hover-accent-bg-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Select HabitKit JSON File
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Display */}
          {(isProcessing || progress.stage === 'completed' || progress.stage === 'error') && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {progress.stage === 'completed' && <CheckCircle className="w-6 h-6 text-green-500" />}
                {progress.stage === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
                {isProcessing && (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {progress.message}
                </div>
              </div>

              {progress.totalHabits > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Habits: {progress.habitsProcessed} / {progress.totalHabits}</span>
                    <span>{Math.round((progress.habitsProcessed / progress.totalHabits) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.habitsProcessed / progress.totalHabits) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {progress.totalCompletions > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Completions: {progress.completionsProcessed} / {progress.totalCompletions}</span>
                    <span>{Math.round((progress.completionsProcessed / progress.totalCompletions) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.completionsProcessed / progress.totalCompletions) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {progress.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                    Errors ({progress.errors.length}):
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300 space-y-1 max-h-20 overflow-y-auto">
                    {progress.errors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          {progress.stage === 'idle' && selectedFile && (
            <>
              <button
                onClick={resetImport}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={processImport}
                className="accent-bg-500 hover-accent-bg-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Import
              </button>
            </>
          )}
          
          {(progress.stage === 'completed' || progress.stage === 'error') && (
            <>
              <button
                onClick={resetImport}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Import Another
              </button>
              <button
                onClick={onClose}
                className="accent-bg-500 hover-accent-bg-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </>
          )}
          
          {progress.stage === 'idle' && !selectedFile && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}