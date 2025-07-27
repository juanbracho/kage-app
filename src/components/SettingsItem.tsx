import React from 'react'
import { ChevronRight } from 'lucide-react'
import ToggleSwitch from './ToggleSwitch'

interface SettingsItemProps {
  icon: React.ReactNode
  iconBgColor?: string
  title: string
  subtitle?: string
  value?: string | React.ReactNode
  badge?: React.ReactNode
  type?: 'navigate' | 'toggle' | 'value' | 'action'
  checked?: boolean
  disabled?: boolean
  onClick?: () => void
  onToggle?: (checked: boolean) => void
  className?: string
}

export default function SettingsItem({
  icon,
  iconBgColor = 'bg-gray-500',
  title,
  subtitle,
  value,
  badge,
  type = 'navigate',
  checked = false,
  disabled = false,
  onClick,
  onToggle,
  className = ''
}: SettingsItemProps) {
  const handleClick = () => {
    if (disabled) return
    
    if (type === 'toggle' && onToggle) {
      onToggle(!checked)
    } else if (onClick) {
      onClick()
    }
  }

  const renderRightContent = () => {
    switch (type) {
      case 'toggle':
        return (
          <ToggleSwitch
            checked={checked}
            onChange={onToggle || (() => {})}
            disabled={disabled}
          />
        )
      case 'value':
        return (
          <div className="flex items-center gap-2">
            {value && (
              <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
            )}
            {badge}
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        )
      case 'action':
        return (
          <div className="flex items-center gap-2">
            {value}
            {badge}
          </div>
        )
      default: // navigate
        return (
          <div className="flex items-center gap-2">
            {value && (
              <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
            )}
            {badge}
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        )
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'}
        ${className}
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon */}
        <div className={`
          w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0
          ${iconBgColor}
        `}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-shrink-0 ml-3">
        {renderRightContent()}
      </div>
    </div>
  )
}