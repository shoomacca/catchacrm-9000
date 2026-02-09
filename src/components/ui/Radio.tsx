import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  radioSize?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  orientation = 'vertical',
  radioSize = 'md',
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const helperSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className={`space-${orientation === 'vertical' ? 'y' : 'x'}-3 ${orientation === 'horizontal' ? 'flex flex-wrap' : ''}`}>
        {options.map((option) => {
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={`flex items-start gap-2.5 ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="sr-only peer"
                />
                <div
                  className={`
                    ${sizeClasses[radioSize]}
                    ${error ? 'border-red-500' : 'border-slate-300'}
                    ${isDisabled ? 'bg-slate-100' : 'bg-white'}
                    border-2 rounded-full
                    transition-all duration-200
                    peer-checked:border-blue-600
                    peer-focus:ring-4 peer-focus:ring-blue-500/20
                    flex items-center justify-center
                  `}
                >
                  {isChecked && (
                    <div className={`${radioSize === 'sm' ? 'w-2 h-2' : radioSize === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'} bg-blue-600 rounded-full`} />
                  )}
                </div>
              </div>
              <div>
                <span className={`${labelSizeClasses[radioSize]} font-medium text-slate-700 leading-tight block`}>
                  {option.label}
                </span>
                {option.helperText && (
                  <span className={`${helperSizeClasses[radioSize]} font-medium text-slate-500 block mt-1`}>
                    {option.helperText}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';
