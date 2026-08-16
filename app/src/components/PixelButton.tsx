import { cn } from '@/lib/utils';

interface PixelButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

/**
 * Organic pill button. The old 3px ink border is gone; the pixel echo is the
 * chunky `0 4px 0 var(--t-drop)` offset carried by `.btn-primary`.
 */
export default function PixelButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className,
  disabled = false,
  type = 'button',
}: PixelButtonProps) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn-ghost',
    danger: 'btn-primary bg-err hover:bg-accent-deep',
  };

  const sizes = {
    sm: 'text-[15px] px-6 py-2.5',
    md: 'text-[17px] px-7 py-3',
    lg: 'text-[22px] px-9 py-4',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn('btn', variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}
