import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  selectSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    error,
    helperText,
    options,
    placeholder,
    selectSize = 'md',
    fullWidth = false,
    className = '',
    disabled = false,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-sm px-3 pr-8',
      md: 'h-10 text-base px-4 pr-10',
      lg: 'h-12 text-lg px-5 pr-12'
    };

    const iconSizeClasses = {
      sm: 'right-2',
      md: 'right-3',
      lg: 'right-4'
    };

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
        {label && (
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`
              ${sizeClasses[selectSize]}
              ${fullWidth ? 'w-full' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}
              ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-900 cursor-pointer'}
              border rounded-lg
              font-medium
              appearance-none
              transition-all duration-200
              focus:outline-none focus:ring-4
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute top-1/2 -translate-y-1/2 ${iconSizeClasses[selectSize]} text-slate-400 pointer-events-none`}
            size={selectSize === 'sm' ? 14 : selectSize === 'md' ? 16 : 18}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs font-medium text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
