import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    inputSize = 'md',
    fullWidth = false,
    className = '',
    disabled = false,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-sm px-3',
      md: 'h-10 text-base px-4',
      lg: 'h-12 text-lg px-5'
    };

    const iconSizeClasses = {
      sm: 'left-2.5 text-slate-400',
      md: 'left-3 text-slate-400',
      lg: 'left-4 text-slate-500'
    };

    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
        {label && (
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={`absolute top-1/2 -translate-y-1/2 ${iconSizeClasses[inputSize]} pointer-events-none`}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={`
              ${sizeClasses[inputSize]}
              ${hasLeftIcon ? (inputSize === 'sm' ? 'pl-8' : inputSize === 'md' ? 'pl-10' : 'pl-12') : ''}
              ${hasRightIcon ? (inputSize === 'sm' ? 'pr-8' : inputSize === 'md' ? 'pr-10' : 'pr-12') : ''}
              ${fullWidth ? 'w-full' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}
              ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-900'}
              border rounded-lg
              font-medium
              transition-all duration-200
              focus:outline-none focus:ring-4
              placeholder:text-slate-400
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className={`absolute top-1/2 -translate-y-1/2 right-3 ${iconSizeClasses[inputSize].split(' ')[1]} pointer-events-none`}>
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
