import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles using design tokens
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    // Variant styles using design tokens
    const variantStyles = {
      primary: 'bg-brand-primary-600 hover:bg-brand-primary-700 text-white shadow-md hover:shadow-brand focus:ring-brand-primary-500/20',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm hover:shadow-md focus:ring-slate-500/20',
      ghost: 'bg-transparent hover:bg-slate-50 text-slate-600 hover:text-brand-primary-600 border border-slate-200 hover:border-brand-primary-500 focus:ring-brand-primary-500/20',
      danger: 'bg-brand-danger-600 hover:bg-brand-danger-700 text-white shadow-md focus:ring-brand-danger-500/20',
      success: 'bg-brand-success-600 hover:bg-brand-success-700 text-white shadow-md focus:ring-brand-success-500/20',
    };

    // Size styles using design tokens
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm rounded-md gap-2',
      md: 'px-6 py-3 text-base rounded-md gap-2',
      lg: 'px-8 py-4 text-lg rounded-md gap-3',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combine all styles
    const buttonClasses = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${widthStyles}
      ${className}
    `.trim();

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={buttonClasses}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
