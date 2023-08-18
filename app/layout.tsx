import type { Metadata } from 'next';
import Image from 'next/image';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sunrise briefing',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFFAF3] text-[#292928]">
        <div className="mx-auto my-10 max-w-2xl">
          <div className="flex items-center gap-4">
            <Image
              className="w-16 h-16"
              src="/logo.png"
              width="800"
              height="800"
              alt=""
            />
            <h1 className="text-7xl text-center font-playfair-display">
              Sunrise Briefing
            </h1>
          </div>
          <div className="py-2">{children}</div>
        </div>
      </body>
    </html>
  );
}
