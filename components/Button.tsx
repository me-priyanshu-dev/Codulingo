import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'correct';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyles = "font-bold uppercase tracking-widest rounded-2xl transition-all transform active:scale-95 focus:outline-none flex items-center justify-center select-none";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm border-b-[3px] active:border-b-0 active:translate-y-[3px]",
    md: "px-6 py-3 text-base border-b-4 active:border-b-0 active:translate-y-1",
    lg: "px-8 py-4 text-lg border-b-[5px] active:border-b-0 active:translate-y-[5px]"
  };

  // Dark Theme Variant Map
  const variants = {
    primary: "bg-duo-green text-duo-bg border-duo-green-dark hover:bg-opacity-90 shadow-lg shadow-duo-green/20",
    secondary: "bg-duo-blue-accent text-white border-duo-blue-dark hover:bg-opacity-90 shadow-lg shadow-duo-blue-accent/20",
    danger: "bg-duo-red text-white border-duo-red-dark hover:bg-opacity-90",
    correct: "bg-duo-green text-duo-bg border-duo-green-dark pointer-events-none", 
    outline: "bg-transparent text-duo-text border-2 border-duo-gray hover:bg-duo-card active:border-duo-gray",
    ghost: "bg-transparent text-duo-text-sub border-none shadow-none hover:bg-duo-card/50 active:translate-y-0"
  };

  const disabledStyles = props.disabled 
    ? "opacity-50 cursor-not-allowed active:transform-none active:border-b-4 filter grayscale" 
    : "";

  return (
    <button 
      className={`
        ${baseStyles} 
        ${sizeStyles[size]} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabledStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};