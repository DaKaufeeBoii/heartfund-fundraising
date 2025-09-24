
import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 duration-200 ease-in-out';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-blue-900 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-red-700 focus:ring-secondary',
    accent: 'bg-accent text-neutral hover:bg-amber-500 focus:ring-accent',
  };

  const sizeStyles = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-2.5 px-5 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
