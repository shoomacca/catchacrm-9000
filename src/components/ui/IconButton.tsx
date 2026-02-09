import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label: string; // For accessibility
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = 'ghost',
      size = 'md',
      label,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 rounded-full';

    const variantStyles = {
      primary: 'bg-brand-primary-600 hover:bg-brand-primary-700 text-white shadow-md focus:ring-brand-primary-500/20',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm focus:ring-slate-500/20',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-brand-primary-600 focus:ring-slate-500/20',
      danger: 'bg-brand-danger-600 hover:bg-brand-danger-700 text-white shadow-md focus:ring-brand-danger-500/20',
    };

    const sizeStyles = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
    };

    const buttonClasses = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `.trim();

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={buttonClasses}
        aria-label={label}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
