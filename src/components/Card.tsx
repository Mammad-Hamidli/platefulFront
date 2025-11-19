import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  ...rest
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`} {...rest}>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
};

