import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#0095f6] text-white hover:bg-[#1877f2] font-semibold disabled:opacity-30 disabled:cursor-not-allowed active:opacity-70',
      secondary: 'bg-transparent border border-[#dbdbdb] text-gray-900 hover:bg-gray-50 font-semibold',
      ghost: 'bg-transparent hover:bg-gray-50 text-gray-900',
      danger: 'bg-red-500 text-white hover:bg-red-600 font-semibold',
    };

    const sizes = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 h-[32px] text-[14px]',
      lg: 'px-6 py-2 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-lg font-semibold transition-all disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
