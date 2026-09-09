import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Poguns — Space Combat Gun Game',
  description: 'Fast-paced neon arcade 2D space combat shooter. Pilot your ship, destroy enemies, and survive.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050510] text-white antialiased overflow-hidden">{children}</body>
    </html>
  );
}
