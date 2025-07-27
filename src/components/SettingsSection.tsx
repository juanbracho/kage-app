import React from 'react'

interface SettingsSectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function SettingsSection({ 
  title, 
  icon, 
  children, 
  className = '' 
}: SettingsSectionProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm ${className}`}>
      {/* Section Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          {icon && <span className="text-lg">{icon}</span>}
          {title}
        </h2>
      </div>

      {/* Section Content */}
      <div className="divide-y divide-gray-100 dark:divide-gray-600">
        {children}
      </div>
    </div>
  )
}