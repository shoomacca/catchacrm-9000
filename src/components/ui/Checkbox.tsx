import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  checkboxSize?: 'sm' | 'md' | 'lg';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    label,
    error,
    helperText,
    checkboxSize = 'md',
    className = '',
    disabled = false,
    checked,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const iconSizeClasses = {
      sm: 12,
      md: 14,
      lg: 16
    };

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    return (
      <div>
        <label className={`flex items-start gap-2.5 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              checked={checked}
              className="sr-only peer"
              {...props}
            />
            <div
              className={`
                ${sizeClasses[checkboxSize]}
                ${error ? 'border-red-500' : 'border-slate-300'}
                ${disabled ? 'bg-slate-100' : 'bg-white'}
                border-2 rounded
                transition-all duration-200
                peer-checked:bg-blue-600 peer-checked:border-blue-600
                peer-focus:ring-4 peer-focus:ring-blue-500/20
                flex items-center justify-center
              `}
            >
              {checked && (
                <Check
                  size={iconSizeClasses[checkboxSize]}
                  className="text-white"
                  strokeWidth={3}
                />
              )}
            </div>
          </div>
          {label && (
            <span className={`${labelSizeClasses[checkboxSize]} font-medium text-slate-700 leading-tight`}>
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="mt-1.5 text-xs font-semibold text-red-600 ml-7">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs font-medium text-slate-500 ml-7">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
