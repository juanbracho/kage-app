import { Task } from '../types/task';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';

interface GroceryListCardProps {
  groceryTasks: Task[];
  onTaskClick: (taskId: string) => void;
  onItemToggle: (taskId: string, itemIndex: number) => void;
}

export default function GroceryListCard({ groceryTasks, onTaskClick, onItemToggle }: GroceryListCardProps) {
  if (groceryTasks.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-5 h-5 accent-text-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Shopping Lists</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({groceryTasks.length} list{groceryTasks.length > 1 ? 's' : ''})
        </span>
      </div>

      <div className="space-y-3">
        {groceryTasks.map((task) => (
          <div 
            key={task.id} 
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => onTaskClick(task.id)}
          >
            {/* Task Title */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {task.name}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {task.shoppingItems?.filter(item => item.name).length || 0} items
              </span>
            </div>

            {/* Shopping Items Grid */}
            {task.shoppingItems && task.shoppingItems.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {task.shoppingItems
                  .filter(item => item.name && item.name.trim() !== '')
                  .slice(0, 4) // Show max 4 items in dashboard card
                  .map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemToggle(task.id, index);
                      }}
                    >
                      <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        {item.completed && (
                          <Check className="w-3 h-3 accent-text-600" />
                        )}
                      </div>
                      <span className={`flex-1 ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.quantity && item.quantity !== '1' ? `${item.quantity} ` : ''}{item.name}
                      </span>
                    </div>
                  ))}
                
                {task.shoppingItems.filter(item => item.name).length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    +{task.shoppingItems.filter(item => item.name).length - 4} more items...
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}