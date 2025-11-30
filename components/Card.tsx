"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-white/10 bg-white/5 p-6 
        shadow-md hover:bg-white/10 transition cursor-pointer 
        ${className}
      `}
    >
      {children}
    </div>
  );
}
