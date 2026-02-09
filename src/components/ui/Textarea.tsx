import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    error,
    helperText,
    fullWidth = false,
    resize = 'vertical',
    className = '',
    disabled = false,
    rows = 4,
    ...props
  }, ref) => {
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
        {label && (
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={`
            ${fullWidth ? 'w-full' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-900'}
            ${resizeClasses[resize]}
            border rounded-lg
            px-4 py-3
            text-base font-medium
            transition-all duration-200
            focus:outline-none focus:ring-4
            placeholder:text-slate-400
            ${className}
          `}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
