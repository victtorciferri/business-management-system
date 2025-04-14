import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Container component for layout with consistent padding and max-width
 */
export function Container({
  children,
  className = '',
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </Component>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Section component for consistent vertical spacing
 */
export function Section({ children, className = '', id }: SectionProps) {
  return (
    <section className={`py-12 md:py-16 ${className}`} id={id}>
      {children}
    </section>
  );
}

/**
 * Grid component with responsive behavior
 */
export function Grid({
  children,
  className = '',
  cols = 1,
}: {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[cols];

  return <div className={`grid gap-6 ${colsClass} ${className}`}>{children}</div>;
}