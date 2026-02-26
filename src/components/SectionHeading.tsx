import type { ReactNode } from 'react';

const SectionHeading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="section-heading">
    <h2>{title}</h2>
    {subtitle ? <p>{subtitle}</p> : null}
  </div>
);

export default SectionHeading;
