import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-transparent border-t-violet-500 border-r-violet-400',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size, className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={cn(spinnerVariants({ size }), className)} />
      {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
}
