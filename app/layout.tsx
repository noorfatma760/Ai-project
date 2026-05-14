import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#070B18] via-[#0B1220] to-[#050816] text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
