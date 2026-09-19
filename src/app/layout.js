'use client';
import './globals.css';
import { usePathname } from 'next/navigation';
import { LanguageProvider } from '@/context/LanguageContext';
import { UserProvider } from '@/context/UserContext';
import FuturisticBackground from '@/components/FuturisticBackground';
import Navbar from '@/components/Navbar';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <UserProvider>
            <FuturisticBackground />
            {!isAuthPage && <Navbar />}
            {children}
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
