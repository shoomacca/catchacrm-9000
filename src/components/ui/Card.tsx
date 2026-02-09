import React from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardAs = 'div' | 'button' | 'a';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  padding?: CardPadding;
  hover?: boolean;
  bordered?: boolean;
  shadowed?: boolean;
  fullWidth?: boolean;
  as?: CardAs;
  href?: string;
}

export interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  padding?: CardPadding;
  className?: string;
}

export interface CardBodyProps {
  padding?: CardPadding;
  divider?: boolean;
  scrollable?: boolean;
  maxHeight?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface CardFooterProps {
  align?: 'left' | 'center' | 'right' | 'space-between';
  bordered?: boolean;
  padding?: CardPadding;
  className?: string;
  children?: React.ReactNode;
}

// Padding utility
const getPaddingClasses = (padding: CardPadding = 'md'): string => {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  return paddingMap[padding];
};

// Card Component
const Card = React.forwardRef<HTMLElement, CardProps>(
  (
    {
      children,
      padding = 'md',
      hover = false,
      bordered = true,
      shadowed = true,
      fullWidth = false,
      as = 'div',
      className = '',
      href,
      onClick,
      ...props
    },
    ref
  ) => {
    const Component = as;
    const isInteractive = as === 'button' || as === 'a' || !!onClick;

    const baseStyles = 'bg-white rounded-lg transition-all duration-200';
    const borderStyles = bordered ? 'border border-slate-200' : '';
    const shadowStyles = shadowed ? 'shadow-sm' : '';
    const hoverStyles = hover || isInteractive
      ? 'hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5'
      : '';
    const widthStyles = fullWidth ? 'w-full' : '';
    const interactiveStyles = isInteractive
      ? 'cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20'
      : '';
    const paddingStyles = getPaddingClasses(padding);

    const cardClasses = `
      ${baseStyles}
      ${borderStyles}
      ${shadowStyles}
      ${hoverStyles}
      ${widthStyles}
      ${interactiveStyles}
      ${paddingStyles}
      ${className}
    `.trim();

    const componentProps = {
      ref: ref as any,
      className: cardClasses,
      onClick,
      ...(as === 'a' && href ? { href } : {}),
      ...(as === 'button' ? { type: 'button' } : {}),
      ...props,
    };

    return <Component {...componentProps}>{children}</Component>;
  }
);

Card.displayName = 'Card';

// CardHeader Component
export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  padding = 'none',
  className = '',
}) => {
  const paddingStyles = getPaddingClasses(padding);

  return (
    <div className={`flex items-start justify-between ${paddingStyles} ${className}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && <div className="flex-shrink-0 text-slate-500">{icon}</div>}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm font-medium text-slate-500 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

// CardBody Component
export const CardBody: React.FC<CardBodyProps> = ({
  padding = 'none',
  divider = false,
  scrollable = false,
  maxHeight,
  className = '',
  children,
}) => {
  const paddingStyles = getPaddingClasses(padding);
  const dividerStyles = divider ? 'border-t border-slate-200' : '';
  const scrollStyles = scrollable ? 'overflow-y-auto' : '';
  const heightStyles = maxHeight ? `max-h-[${maxHeight}]` : '';

  return (
    <div
      className={`
        ${paddingStyles}
        ${dividerStyles}
        ${scrollStyles}
        ${heightStyles}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

CardBody.displayName = 'CardBody';

// CardFooter Component
export const CardFooter: React.FC<CardFooterProps> = ({
  align = 'right',
  bordered = false,
  padding = 'none',
  className = '',
  children,
}) => {
  const alignmentMap = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    'space-between': 'justify-between',
  };

  const paddingStyles = getPaddingClasses(padding);
  const borderStyles = bordered ? 'border-t border-slate-200' : '';
  const alignStyles = alignmentMap[align];

  return (
    <div
      className={`
        flex items-center gap-2
        ${paddingStyles}
        ${borderStyles}
        ${alignStyles}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';

export default Card;
