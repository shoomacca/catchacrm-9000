import React from 'react';

export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
}) => {
  const baseStyles = 'inline-flex';

  const orientationStyles = {
    horizontal: 'flex-row gap-2',
    vertical: 'flex-col gap-2',
  };

  const groupClasses = `
    ${baseStyles}
    ${orientationStyles[orientation]}
    ${className}
  `.trim();

  return <div className={groupClasses}>{children}</div>;
};

export default ButtonGroup;
