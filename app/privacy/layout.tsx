import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ScratchWin | Modern Instant Games',
  description: 'Experience the thrill of instant real-world rewards with our modern scratch card games.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-[#0B1220] text-slate-50 selection:bg-[#4F9CFF]/30 relative">
        {/* Animated Ambient Background */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Base Deep Navy -> Purple Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220] via-[#111C33] to-[#1A1B3A]" />
          
          {/* Subtle Noise Texture for Premium Atmosphere */}
          <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
          
          {/* Floating Atmospheric Light Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#4F9CFF]/15 blur-[120px] animate-drift" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#1A1B3A]/90 blur-[150px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#4F9CFF]/10 blur-[120px] animate-drift" style={{ animationDelay: '5s' }} />
          
          {/* Dark Vignette Border */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0B1220_150%)]" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col min-h-screen w-full">
          <Navbar />
          <main className="flex-1 flex flex-col w-full overflow-hidden">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
