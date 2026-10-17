'use client';

import TheAwakening from './the-awakening';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <iframe
        src="/portfolio?intro=off"
        title="Página inicial de Nox Vesper"
        className="fixed inset-0 h-screen w-screen border-0"
        allow="autoplay"
      />
      <TheAwakening />
    </main>
  );
}
