import { motion, HTMLMotionProps } from 'framer-motion';
import { radius, font } from './tokens';
import React from 'react';

type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, className = '', ...rest }, ref) => {
    let style = '';
    if (variant === 'primary') {
      style = `bg-[#888888] text-white hover:bg-[#555555]`;
    } else if (variant === 'secondary') {
      style = `bg-transparent text-[#888888] border border-[#888888] hover:bg-[#555555] hover:text-white`;
    } else {
      style = `bg-transparent text-[#888888] hover:bg-[#555555]`;
    }
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2E2E2E] transition-all duration-150 shadow-sm ${style} ${className}`}
        style={{ fontFamily: font.heading, borderRadius: radius.full }}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button'; 