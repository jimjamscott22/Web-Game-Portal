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

export default function PixelButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className,
  disabled = false,
  type = 'button',
}: PixelButtonProps) {
  const base = 'font-pixel font-semibold rounded-pill border-[3px] border-dark btn-bounce inline-flex items-center justify-center gap-2 select-none';

  const variants = {
    primary: 'bg-primary text-white shadow-button hover:shadow-button-hover hover:bg-[#5A8083] active:shadow-button-active active:translate-y-1',
    secondary: 'bg-secondary text-dark shadow-button hover:shadow-button-hover hover:bg-secondary-hover active:shadow-button-active active:translate-y-1',
    tertiary: 'bg-transparent text-dark shadow-button hover:shadow-button-hover hover:bg-[#F5F5F5] active:shadow-button-active active:translate-y-1',
    danger: 'bg-game-orange text-white shadow-button hover:shadow-button-hover hover:bg-[#D45A24] active:shadow-button-active active:translate-y-1',
  };

  const sizes = {
    sm: 'text-sm px-5 py-2.5',
    md: 'text-xl px-8 py-3.5',
    lg: 'text-2xl px-10 py-4',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}
