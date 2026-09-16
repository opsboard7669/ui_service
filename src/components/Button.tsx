import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  glow?: boolean
}

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className = '', children, loading, glow = true, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`gradient-btn ${glow ? 'animate-pulse-glow' : ''} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

PrimaryButton.displayName = 'PrimaryButton'

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className = '', children, loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`gradient-btn-outline ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

SecondaryButton.displayName = 'SecondaryButton'

interface ViewToggleProps<T extends string> {
  options: { id: T; label: string; icon?: React.ReactNode }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export const ViewToggle = <T extends string>({ options, value, onChange, className = '' }: ViewToggleProps<T>) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value === option.id
              ? 'bg-primary text-white'
              : 'bg-white/5 text-secondary hover:bg-white/10'
          }`}
        >
          {option.icon && <span className="inline-flex items-center gap-1.5">{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
