'use client';

import { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Texto de ajuda exibido abaixo do input (não confundir com error). */
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    // Quando ambos error e hint estão presentes, aria-describedby aponta para os dois
    // (a ordem importa: screen readers anunciam o erro primeiro).
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          // aria-invalid + aria-describedby tornam o erro anunciável por screen
          // readers (NVDA/JAWS leem "inválido" + o texto do erro automaticamente).
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`
            px-4 py-2.5 rounded-lg border bg-background text-text-primary
            placeholder:text-text-secondary
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${error ? 'border-error' : 'border-border'}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <span id={hintId} className="text-xs text-text-secondary">
            {hint}
          </span>
        )}
        {error && (
          <span id={errorId} className="text-xs text-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
