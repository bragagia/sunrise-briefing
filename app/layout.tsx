import type { Metadata } from 'next';
import Image from 'next/image';

import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sunrise briefing',
  description: '',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </head>

      <body className=" bg-[#FFFAF3] text-[#292928]">
        <div className="my-10 max-w-2xl mx-auto">
          <div className="mx-8">
            <div className="flex items-center justify-center gap-4 mb-12">
              <Image
                className="w-10 h-10 md:w-16 md:h-16"
                src="/logo.png"
                width="800"
                height="800"
                alt=""
              />

              <div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl text-center font-playfair-display">
                  Sunrise Briefing
                </h1>
              </div>
            </div>

            {children}

            <div className="my-16 text-center">
              <span className="font-bold">Fait avec ❤️ par :</span>
              <ul className="pl-5">
                <li>
                  <Link
                    className="text-blue-800"
                    href="https://mathias.bragagia.com"
                  >
                    Mathias Bragagia
                  </Link>
                  ,
                </li>
                <li>
                  <Link className="text-blue-800" href="https://tmo.one/">
                    Thibault Miranda de Oliveira,
                  </Link>
                </li>
                <li>Florent Bertrand</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
