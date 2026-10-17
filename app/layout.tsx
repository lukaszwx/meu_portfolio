import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nox Vesper — Lucas Neves',
  description: 'Site de Lucas Neves: interfaces, aplicações web e experiências digitais.',
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
