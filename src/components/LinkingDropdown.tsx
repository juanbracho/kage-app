import { useState, useRef, useEffect } from 'react'
import { Search, Check } from 'lucide-react'

interface DropdownItem {
  id: string
  name: string
  icon?: string
  color?: string
  description?: string
  progress?: number
  isCompleted?: boolean
}

interface LinkingDropdownProps {
  isOpen: boolean
  onClose: () => void
  items: DropdownItem[]
  selectedItems: string[]
  onItemSelect: (itemId: string) => void
  onItemDeselect: (itemId: string) => void
  title: string
  icon: string
  emptyMessage?: string
  searchPlaceholder?: string
}

export default function LinkingDropdown({
  isOpen,
  onClose,
  items,
  selectedItems,
  onItemSelect,
  onItemDeselect,
  title,
  icon,
  emptyMessage = "No items available",
  searchPlaceholder = "Search items..."
}: LinkingDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Check if click is on the toggle button (which should be handled separately)
        const target = event.target as Element
        if (!target.closest('[data-dropdown-toggle]')) {
          onClose()
        }
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setFocusedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        )
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        )
      } else if (event.key === 'Enter' && focusedIndex >= 0) {
        event.preventDefault()
        const item = filteredItems[focusedIndex]
        if (item) {
          handleItemToggle(item)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Reset focus index when filtered items change
  useEffect(() => {
    setFocusedIndex(-1)
  }, [searchQuery])

  // Focus management for keyboard navigation
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex])

  const handleItemToggle = (item: DropdownItem) => {
    const isSelected = selectedItems.includes(item.id)
    if (isSelected) {
      onItemDeselect(item.id)
    } else {
      onItemSelect(item.id)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-hidden"
      role="listbox"
      aria-label={`Select ${title}`}
      aria-multiselectable="true"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            Select {title}
          </span>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus-accent-ring focus-accent-border outline-none"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="max-h-48 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            {searchQuery ? `No ${title.toLowerCase()} found matching "${searchQuery}"` : emptyMessage}
          </div>
        ) : (
          <div className="p-2">
            {filteredItems.map((item, index) => {
              const isSelected = selectedItems.includes(item.id)
              const isFocused = index === focusedIndex
              
              return (
                <button
                  key={item.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleItemToggle(item)
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'accent-bg-50 dark:accent-bg-900 accent-border-200 border'
                      : isFocused 
                        ? 'bg-gray-100 dark:bg-gray-600'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  aria-selected={isSelected}
                  role="option"
                >
                  {/* Selection Indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'accent-bg-500 accent-border-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Item Icon */}
                  {item.icon && (
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm truncate ${
                        isSelected ? 'accent-text-700 dark:accent-text-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.name}
                      </span>
                      
                      {/* Progress/Status Indicator */}
                      {item.isCompleted !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                          item.isCompleted
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {item.isCompleted ? 'Complete' : 'In Progress'}
                        </span>
                      )}
                      
                      {item.progress !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {Math.round(item.progress)}%
                        </span>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredItems.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {selectedItems.length} of {items.length} selected
          </div>
        </div>
      )}
    </div>
  )
}