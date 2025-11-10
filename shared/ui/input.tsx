import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full h-[38px] px-2 text-xs border border-[#dbdbdb] rounded-[3px] bg-[#fafafa] focus:outline-none focus:border-[#a8a8a8] transition-colors placeholder:text-[#737373]',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
