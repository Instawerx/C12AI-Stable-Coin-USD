import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'C12USD - Cross-Chain Stablecoin',
  description: 'The next generation stablecoin with DAO governance and cross-chain capabilities',
  keywords: ['stablecoin', 'defi', 'dao', 'cross-chain', 'crypto', 'web3'],
  authors: [{ name: 'C12AI DAO' }],
  creator: 'C12AI DAO',
  publisher: 'C12AI DAO',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://c12usd.com',
    title: 'C12USD - Cross-Chain Stablecoin',
    description: 'The next generation stablecoin with DAO governance and cross-chain capabilities',
    siteName: 'C12USD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'C12USD - Cross-Chain Stablecoin',
    description: 'The next generation stablecoin with DAO governance and cross-chain capabilities',
    creator: '@C12AI_DAO',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#007AFF' },
    { media: '(prefers-color-scheme: dark)', color: '#007AFF' },
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="C12USD" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#007AFF" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} bg-background-primary dark:bg-background-dark-primary min-h-screen transition-colors duration-300`}>
        <Providers>
          <AuthProvider>
            <div className="relative min-h-screen">
              {/* Background Effects */}
              <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent" />
              </div>

              {/* Main Content */}
              <main className="relative z-10">
                {children}
              </main>

              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'rgba(0, 0, 0, 0.9)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#34C759',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#FF3B30',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}