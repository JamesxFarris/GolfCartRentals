import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100
        ${hover ? "hover:shadow-lg transition-shadow duration-300" : ""}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
