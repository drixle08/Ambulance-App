"use client";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function Button({ label, onClick, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition ${className}`}
    >
      {label}
    </button>
  );
}
