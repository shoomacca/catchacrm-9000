import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type PanelPadding = 'none' | 'sm' | 'md' | 'lg';
export type PanelVariant = 'default' | 'bordered' | 'elevated';

export interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  variant?: PanelVariant;
  headerPadding?: PanelPadding;
  bodyPadding?: PanelPadding;
  footerPadding?: PanelPadding;
  className?: string;
  onExpandedChange?: (expanded: boolean) => void;
}

// Padding utility
const getPaddingClasses = (padding: PanelPadding = 'md'): string => {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  return paddingMap[padding];
};

const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  icon,
  headerActions,
  children,
  footer,
  collapsible = false,
  defaultExpanded = true,
  variant = 'default',
  headerPadding = 'md',
  bodyPadding = 'md',
  footerPadding = 'md',
  className = '',
  onExpandedChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-white border border-slate-200',
    bordered: 'bg-white border-2 border-slate-300',
    elevated: 'bg-white shadow-md border border-slate-100',
  };

  const panelClasses = `
    ${variantStyles[variant]}
    rounded-lg
    transition-all duration-200
    ${className}
  `.trim();

  const headerPaddingStyles = getPaddingClasses(headerPadding);
  const bodyPaddingStyles = getPaddingClasses(bodyPadding);
  const footerPaddingStyles = getPaddingClasses(footerPadding);

  return (
    <div className={panelClasses}>
      {/* Header */}
      {(title || subtitle || headerActions) && (
        <div
          className={`
            flex items-start justify-between
            border-b border-slate-200
            ${headerPaddingStyles}
            ${collapsible ? 'cursor-pointer hover:bg-slate-50' : ''}
          `.trim()}
          onClick={collapsible ? handleToggle : undefined}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {icon && (
              <div className="flex-shrink-0 text-slate-500 mt-0.5">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-slate-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm font-medium text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {headerActions && !collapsible && (
              <div onClick={(e) => e.stopPropagation()}>
                {headerActions}
              </div>
            )}
            {collapsible && (
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      {isExpanded && (
        <div className={bodyPaddingStyles}>
          {children}
        </div>
      )}

      {/* Footer */}
      {isExpanded && footer && (
        <div
          className={`
            border-t border-slate-200
            ${footerPaddingStyles}
          `.trim()}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

Panel.displayName = 'Panel';

export default Panel;
