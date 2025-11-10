import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, maxLength, showCount, value, ...props }, ref) => {
    const currentLength = value?.toString().length || 0;

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {showCount && maxLength && (
              <span className="text-xs text-gray-500">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm resize-none',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
