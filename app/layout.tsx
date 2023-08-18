import type { Metadata } from 'next';
import Image from 'next/image';

import 'react-toastify/dist/ReactToastify.css';
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
  const date = new Date(Date.now());
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formatedDate = date.toLocaleDateString('fr-FR', options);

  return (
    <html lang="fr">
      <body className=" bg-[#FFFAF3] text-[#292928]">
        <div className="my-10 max-w-2xl mx-auto">
          <div className="mx-8">
            <div className="flex items-center justify-center gap-4 mb-12">
              <Image
                className="w-10 h-10 md:w-16 md:h-16 mb-6" /* mb-6 to correct vertical center due to date */
                src="/logo.png"
                width="800"
                height="800"
                alt=""
              />

              <div>
                <h1 className="text-3xl md:text-7xl text-center font-playfair-display">
                  Sunrise Briefing
                </h1>

                <p className="font-playfair-display text-center">
                  {formatedDate}
                </p>
              </div>
            </div>

            {children}
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
