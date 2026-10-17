import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  icons: {
    icon: { url: '/assets/raven-original.png', type: 'image/png' },
    apple: '/assets/raven-original.png',
  },
  title: 'Nox Vesper — Lucas Neves',
  description: 'Site de Lucas Neves: interfaces, aplicações web e experiências digitais.',
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
