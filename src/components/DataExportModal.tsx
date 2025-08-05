import React, { useState } from 'react';
import { X, Download, FileJson, Calendar, CheckCircle, AlertCircle, Archive, Smartphone } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useJournalStore } from '../store/journalStore';
import { useCalendarStore } from '../store/calendarStore';
import { useUserStore } from '../store/userStore';
// Capacitor modules will be loaded dynamically when needed

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'kage-full' | 'kage-habits';

interface ExportProgress {
  stage: 'idle' | 'preparing' | 'generating' | 'completed' | 'error';
  message: string;
  progress: number;
  error?: string;
}

interface ExportStats {
  habits: number;
  habitCompletions: number;
  tasks: number;
  goals: number;
  journalEntries: number;
  timeBlocks: number;
}

export default function DataExportModal({ isOpen, onClose }: DataExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('kage-full');
  const [progress, setProgress] = useState<ExportProgress>({
    stage: 'idle',
    message: 'Ready to export your data',
    progress: 0
  });

  const { habits, completions } = useHabitStore();
  const { tasks } = useTaskStore();
  const { goals } = useGoalStore();
  const { entries: journalEntries } = useJournalStore();
  const { timeBlocks } = useCalendarStore();
  const { user } = useUserStore();


  if (!isOpen) return null;

  const getExportStats = (): ExportStats => ({
    habits: habits.length,
    habitCompletions: completions.length,
    tasks: tasks.length,
    goals: goals.length,
    journalEntries: journalEntries.length,
    timeBlocks: timeBlocks.length
  });

  const generateKageFullExport = () => {
    console.log('📤 Export: Generating full backup with relationship preservation');
    
    // Build relationship maps
    const goalTaskMap = new Map<string, string[]>();
    const goalHabitMap = new Map<string, string[]>();
    const taskTimeBlockMap = new Map<string, string[]>();
    const habitTimeTimeBlockMap = new Map<string, string[]>();
    
    // Map tasks to goals
    tasks.forEach(task => {
      if (task.goalId) {
        if (!goalTaskMap.has(task.goalId)) {
          goalTaskMap.set(task.goalId, []);
        }
        goalTaskMap.get(task.goalId)!.push(task.id);
      }
    });
    
    // Map habits to goals (assuming habits can be linked to goals via goalId)
    habits.forEach(habit => {
      if ((habit as any).goalId) {
        if (!goalHabitMap.has((habit as any).goalId)) {
          goalHabitMap.set((habit as any).goalId, []);
        }
        goalHabitMap.get((habit as any).goalId)!.push(habit.id);
      }
    });
    
    // Map time blocks to tasks and habits
    timeBlocks.forEach(block => {
      if (block.linkedItemType === 'task' && block.linkedItemId) {
        if (!taskTimeBlockMap.has(block.linkedItemId)) {
          taskTimeBlockMap.set(block.linkedItemId, []);
        }
        taskTimeBlockMap.get(block.linkedItemId)!.push(block.id);
      } else if (block.linkedItemType === 'habit' && block.linkedItemId) {
        if (!habitTimeTimeBlockMap.has(block.linkedItemId)) {
          habitTimeTimeBlockMap.set(block.linkedItemId, []);
        }
        habitTimeTimeBlockMap.get(block.linkedItemId)!.push(block.id);
      }
    });

    const exportData = {
      exportInfo: {
        version: '1.1.0', // Increment version for relationship support
        exportDate: new Date().toISOString(),
        appVersion: 'Kage Beta',
        format: 'kage-full',
        userProfile: {
          name: user?.name || 'Unknown User',
          email: user?.email || 'unknown@example.com'
        },
        relationshipMetadata: {
          goalTaskMap: Object.fromEntries(goalTaskMap),
          goalHabitMap: Object.fromEntries(goalHabitMap),
          taskTimeBlockMap: Object.fromEntries(taskTimeBlockMap),
          habitTimeBlockMap: Object.fromEntries(habitTimeTimeBlockMap)
        }
      },
      habits: habits.map(habit => ({
        ...habit,
        completions: completions.filter(c => c.habitId === habit.id)
      })),
      tasks: tasks,
      goals: goals,
      journalEntries: journalEntries,
      timeBlocks: timeBlocks,
      statistics: getExportStats()
    };

    console.log('📤 Export: Relationship metadata:', exportData.exportInfo.relationshipMetadata);
    return JSON.stringify(exportData, null, 2);
  };

  const generateKageHabitsExport = () => {
    const exportData = {
      exportInfo: {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        appVersion: 'Kage Beta',
        format: 'kage-habits'
      },
      habits: habits.map(habit => ({
        ...habit,
        completions: completions.filter(c => c.habitId === habit.id)
      })),
      statistics: {
        habits: habits.length,
        habitCompletions: completions.length
      }
    };

    return JSON.stringify(exportData, null, 2);
  };


  const downloadFile = async (content: string, filename: string, contentType: string) => {
    try {
      // Ensure we're on the main thread for WebView operations
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        // Use requestIdleCallback to ensure main thread execution
        return new Promise((resolve, reject) => {
          window.requestIdleCallback(async () => {
            try {
              const result = await performDownload(content, filename, contentType);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
        });
      } else {
        // Fallback: use setTimeout to ensure main thread
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await performDownload(content, filename, contentType);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    } catch (error) {
      console.error('Error downloading/saving file:', error);
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const performDownload = async (content: string, filename: string, contentType: string) => {
    // This function runs guaranteed on main thread
    if (typeof window !== 'undefined') {
      try {
        console.log('🔍 Attempting to load Capacitor modules on main thread...');
        
        // Check if we're on native platform first (synchronous check)
        let isNative = false;
        try {
          // Try to access Capacitor synchronously if already loaded
          if ((window as any).Capacitor) {
            isNative = (window as any).Capacitor.isNativePlatform();
          }
        } catch (e) {
          // Capacitor not loaded yet
        }
        
        if (isNative) {
          console.log('📱 Native platform detected, loading Filesystem module...');
          
          // Load Filesystem module on main thread
          const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
          
          // Execute file write on main thread
          const result = await Filesystem.writeFile({
            path: filename,
            data: content,
            directory: Directory.Documents,
            encoding: Encoding.UTF8
          });
          
          console.log('✅ File saved to Documents directory:', result.uri);
          
          return {
            success: true,
            path: result.uri,
            message: `File saved to Documents folder as ${filename}`
          };
        }
      } catch (capacitorError) {
        console.log('📄 Capacitor modules not available, falling back to web download:', capacitorError);
      }
    }
    
    // Fallback to web browser download API (also on main thread)
    console.log('🌐 Using browser download API');
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      path: 'Downloads folder',
      message: `File downloaded to your browser's Downloads folder as ${filename}`
    };
  };

  const handleExport = async () => {
    const stats = getExportStats();
    let totalItems = 0;
    let processedItems = 0;

    try {
      setProgress({
        stage: 'preparing',
        message: 'Preparing data for export...',
        progress: 0
      });

      // Calculate total items based on format
      switch (selectedFormat) {
        case 'kage-full':
          totalItems = stats.habits + stats.tasks + stats.goals + stats.journalEntries + stats.timeBlocks + stats.habitCompletions;
          break;
        case 'kage-habits':
          totalItems = stats.habits + stats.habitCompletions;
          break;
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate preparation time

      setProgress({
        stage: 'generating',
        message: 'Generating export file...',
        progress: 25
      });

      let exportContent: string;
      let filename: string;
      const timestamp = new Date().toISOString().split('T')[0];

      // Simulate processing progress
      const updateProgress = (items: number, message: string) => {
        processedItems += items;
        const progressPercent = Math.min(25 + (processedItems / totalItems) * 50, 75);
        setProgress({
          stage: 'generating',
          message,
          progress: progressPercent
        });
        return new Promise(resolve => setTimeout(resolve, 100));
      };

      switch (selectedFormat) {
        case 'kage-full':
          await updateProgress(stats.habits, 'Processing habits...');
          await updateProgress(stats.habitCompletions, 'Processing habit completions...');
          await updateProgress(stats.tasks, 'Processing tasks...');
          await updateProgress(stats.goals, 'Processing goals...');
          await updateProgress(stats.journalEntries, 'Processing journal entries...');
          await updateProgress(stats.timeBlocks, 'Processing calendar events...');
          exportContent = generateKageFullExport();
          filename = `kage-full-backup-${timestamp}.json`;
          break;

        case 'kage-habits':
          await updateProgress(stats.habits, 'Processing habits...');
          await updateProgress(stats.habitCompletions, 'Processing completions...');
          exportContent = generateKageHabitsExport();
          filename = `kage-habits-export-${timestamp}.json`;
          break;


        default:
          throw new Error('Invalid export format selected');
      }

      setProgress({
        stage: 'generating',
        message: 'Finalizing export...',
        progress: 90
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Download/save the file
      const result = await downloadFile(exportContent, filename, 'application/json');

      setProgress({
        stage: 'completed',
        message: result.message,
        progress: 100
      });

    } catch (error) {
      setProgress({
        stage: 'error',
        message: 'Export failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const resetExport = () => {
    setProgress({
      stage: 'idle',
      message: 'Ready to export your data',
      progress: 0
    });
  };

  const stats = getExportStats();
  const isProcessing = progress.stage === 'preparing' || progress.stage === 'generating';

  const formatOptions = [
    {
      id: 'kage-full' as ExportFormat,
      title: 'Complete Backup',
      description: 'Full backup including all data types',
      icon: <Archive className="w-5 h-5 text-blue-500" />,
      stats: `${stats.habits} habits, ${stats.tasks} tasks, ${stats.goals} goals, ${stats.journalEntries} entries`
    },
    {
      id: 'kage-habits' as ExportFormat,
      title: 'Habits Only',
      description: 'Export only habit data and completion history',
      icon: <Calendar className="w-5 h-5 text-green-500" />,
      stats: `${stats.habits} habits, ${stats.habitCompletions} completions`
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Export Data
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
          {progress.stage === 'idle' && (
            <div className="space-y-6">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Choose the export format that best fits your needs. All exports are in JSON format.
              </div>

              <div className="space-y-3">
                {formatOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedFormat === option.id
                        ? 'accent-border-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedFormat(option.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{option.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {option.title}
                          </h3>
                          {selectedFormat === option.id && (
                            <CheckCircle className="w-4 h-4 accent-text-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {option.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {option.stats}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <div className="w-6 h-6 border-2 accent-border-500 border-t-transparent rounded-full animate-spin" />
                )}
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {progress.message}
                </div>
              </div>

              {progress.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Progress</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="accent-bg-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {progress.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Export Error:
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300">
                    {progress.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          {progress.stage === 'idle' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedFormat}
                className="accent-bg-500 hover-accent-bg-dark text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Start Export
              </button>
            </>
          )}
          
          {(progress.stage === 'completed' || progress.stage === 'error') && (
            <>
              <button
                onClick={resetExport}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Export Another
              </button>
              <button
                onClick={onClose}
                className="accent-bg-500 hover-accent-bg-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}