import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'App',
  description: 'Fast Next.js App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-[#0B1220] text-white min-h-screen antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
