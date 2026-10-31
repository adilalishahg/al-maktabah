import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: 'Waqf Charter & Scholarly Methodology | Al-Maktabah',
  description:
    'Dedicated to the perpetual preservation and open digital dissemination of classical Islamic scholarship under the Waqf Lillāh endowment framework.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Waqf Charter & Scholarly Methodology | Al-Maktabah',
    description: 'Learn about our academic council, preservation standards, and digital waqf mission.',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}

