'use client';

import React, { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText = 'Loading...',
  fullWidth = false,
  className = '',
  disabled,
  href,
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = "px-4 py-2 rounded transition-all";
  
  // Variant-specific classes
  const variantClasses = {
    primary: "bg-[#FFC1DA] hover:bg-[#FF90BB] text-white shadow-[0_4px_0_0_#FF90BB] hover:shadow-[0_2px_0_0_#FF90BB] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none disabled:bg-[#f8adc5] disabled:shadow-none disabled:hover:translate-y-0",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white shadow-[0_4px_0_0_#374151] hover:shadow-[0_2px_0_0_#374151] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none disabled:bg-gray-400 disabled:shadow-none disabled:hover:translate-y-0",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_0_0_#dc2626] hover:shadow-[0_2px_0_0_#dc2626] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none disabled:bg-red-400 disabled:shadow-none disabled:hover:translate-y-0"
  };
  
  // Full width class
  const widthClass = fullWidth ? "w-full" : "";

  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`;

  // If href is provided, render as a Link
  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  // Otherwise render as a button
  return (
    <button
      className={buttonClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

export default Button; 