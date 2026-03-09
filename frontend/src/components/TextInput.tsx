'use client';

import { forwardRef } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, className, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        {...props}
        className={`w-full py-3.5 px-4 bg-bg-card border rounded-sm font-inherit text-[15px] outline-none transition-colors duration-200 placeholder:text-text-muted ${
          error
            ? 'border-red-500 text-red-400 focus:border-red-500'
            : 'border-border text-text focus:border-accent'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
