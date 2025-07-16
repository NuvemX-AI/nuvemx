import React from 'react';

type SectionProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export const Section: React.FC<SectionProps> = ({ id, className = '', children }) => (
  <section
    id={id}
    className={`w-full py-16 px-4 bg-white ${className}`}
    tabIndex={-1}
  >
    <div className="max-w-7xl mx-auto">{children}</div>
  </section>
); 