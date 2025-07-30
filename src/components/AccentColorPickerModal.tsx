import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import type { AccentColor } from '../types/settings'

interface AccentColorPickerModalProps {
  isOpen: boolean
  onClose: () => void
}

const ACCENT_COLORS = [
  { 
    id: 'orange' as AccentColor, 
    name: 'Orange', 
    value: '#FF7101', 
    lightBg: 'bg-orange-500', 
    darkBg: 'bg-orange-600',
    lightRing: 'ring-orange-500',
    darkRing: 'ring-orange-400'
  },
  { 
    id: 'blue' as AccentColor, 
    name: 'Cyan', 
    value: '#06B6D4', 
    lightBg: 'bg-cyan-500', 
    darkBg: 'bg-cyan-600',
    lightRing: 'ring-cyan-500',
    darkRing: 'ring-cyan-400'
  },
  { 
    id: 'green' as AccentColor, 
    name: 'Emerald', 
    value: '#10B981', 
    lightBg: 'bg-emerald-500', 
    darkBg: 'bg-emerald-600',
    lightRing: 'ring-emerald-500',
    darkRing: 'ring-emerald-400'
  },
  { 
    id: 'purple' as AccentColor, 
    name: 'Purple', 
    value: '#A855F7', 
    lightBg: 'bg-purple-500', 
    darkBg: 'bg-purple-600',
    lightRing: 'ring-purple-500',
    darkRing: 'ring-purple-400'
  },
  { 
    id: 'red' as AccentColor, 
    name: 'Bordeaux', 
    value: '#7C2D12', 
    lightBg: 'bg-red-800', 
    darkBg: 'bg-red-900',
    lightRing: 'ring-red-800',
    darkRing: 'ring-red-700'
  },
  { 
    id: 'yellow' as AccentColor, 
    name: 'Corn', 
    value: '#EAB308', 
    lightBg: 'bg-yellow-500', 
    darkBg: 'bg-yellow-600',
    lightRing: 'ring-yellow-500',
    darkRing: 'ring-yellow-400'
  }
]

export default function AccentColorPickerModal({ isOpen, onClose }: AccentColorPickerModalProps) {
  const { settings, setAccentColor } = useSettingsStore()
  const [selectedColor, setSelectedColor] = useState<AccentColor>(settings.appearance.accentColor)

  const handleColorSelect = (colorId: AccentColor) => {
    setSelectedColor(colorId)
  }

  const handleApply = () => {
    setAccentColor(selectedColor)
    onClose()
  }

  const handleCancel = () => {
    setSelectedColor(settings.appearance.accentColor) // Reset to current setting
    onClose()
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 md:p-5">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm sm:max-w-md max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 text-gray-900 dark:text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Choose Accent Color</h2>
          <button
            onClick={handleCancel}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              Select your preferred accent color. This will be applied throughout the app.
            </p>

            {/* Color Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorSelect(color.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedColor === color.id
                    ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 accent-ring-300 ring-2'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Color Swatch */}
                <div 
                  className={`w-8 h-8 rounded-full ${color.lightBg} shadow-md flex items-center justify-center`}
                >
                  {selectedColor === color.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                
                {/* Color Info */}
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">{color.name}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Preview Section */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">Preview</div>
            <div className="flex items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-lg shadow-md ${
                  ACCENT_COLORS.find(c => c.id === selectedColor)?.lightBg
                } dark:${
                  ACCENT_COLORS.find(c => c.id === selectedColor)?.darkBg
                }`}
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Sample Button</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">This shows how your accent color will look</div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-white transition-all shadow-lg hover:shadow-xl accent-gradient hover:accent-gradient-dark"
          >
            Apply Color
          </button>
        </div>
      </div>
    </div>
  )
}