
interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  color?: 'orange' | 'blue' | 'green' | 'purple'
  className?: string
}

export default function ToggleSwitch({ 
  checked, 
  onChange, 
  disabled = false, 
  size = 'medium',
  color = 'orange',
  className = ''
}: ToggleSwitchProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-10 h-6',
          knob: 'w-4 h-4 top-1 left-1',
          translate: 'translate-x-4'
        }
      case 'large':
        return {
          container: 'w-14 h-8',
          knob: 'w-6 h-6 top-1 left-1',
          translate: 'translate-x-6'
        }
      default: // medium
        return {
          container: 'w-12 h-7',
          knob: 'w-5 h-5 top-1 left-1',
          translate: 'translate-x-5'
        }
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500'
      case 'green':
        return 'bg-green-500'
      case 'purple':
        return 'bg-purple-500'
      default: // orange
        return 'accent-bg-500'
    }
  }

  const sizeClasses = getSizeClasses()
  const colorClass = getColorClasses()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus-accent-ring focus:ring-offset-2
        ${sizeClasses.container}
        ${checked ? colorClass : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
        ${className}
      `}
    >
      <span className="sr-only">Toggle setting</span>
      <span
        className={`
          inline-block bg-white rounded-full shadow-sm transition-transform duration-200
          ${sizeClasses.knob}
          ${checked ? sizeClasses.translate : 'translate-x-0'}
        `}
      />
    </button>
  )
}