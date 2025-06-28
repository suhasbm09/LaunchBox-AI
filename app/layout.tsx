import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { getSecurityHeaders } from '@/lib/security';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'LaunchBox.AI - Build. Test. Simulate. All in One AI DevOps Playground',
    template: '%s | LaunchBox.AI'
  },
  description: 'Revolutionary AI-powered development platform for building, testing, and simulating applications with advanced DevOps automation.',
  keywords: [
    'AI',
    'DevOps',
    'development',
    'testing',
    'simulation',
    'automation',
    'platform',
    'Docker',
    'Jenkins',
    'CI/CD',
    'containerization',
    'deployment'
  ],
  authors: [{ name: 'Suhas B M', url: 'https://portfolio-suhasbm.vercel.app' }],
  creator: 'Suhas B M',
  publisher: 'LaunchBox.AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'LaunchBox.AI - AI DevOps Playground',
    description: 'Revolutionary AI-powered development platform for building, testing, and simulating applications.',
    siteName: 'LaunchBox.AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LaunchBox.AI - AI DevOps Playground',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaunchBox.AI - AI DevOps Playground',
    description: 'Revolutionary AI-powered development platform for building, testing, and simulating applications.',
    images: ['/og-image.png'],
    creator: '@SuhasB22433',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'dark light',
};

// Security headers
export async function generateStaticParams() {
  return [];
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//api.openrouter.ai" />
        
        {/* Security headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance hints */}
        <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Analytics and monitoring scripts would go here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `,
                  }}
                />
              </>
            )}
          </>
        )}
      </head>
      <body 
        className={`${inter.variable} font-sans antialiased bg-primary text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-secondary text-white px-4 py-2 rounded-md z-50 transition-all duration-200"
          >
            Skip to main content
          </a>
          
          <Header />
          
          <main id="main-content" className="pt-16 min-h-screen">
            {children}
          </main>
          
          <Footer />
          
          {/* Toast notifications */}
          <Toaster 
            theme="dark" 
            position="top-right"
            richColors
            closeButton
            expand={true}
            visibleToasts={5}
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                color: 'white',
              },
              className: 'glass-morphism',
              duration: 4000,
            }}
          />
          
          {/* Performance monitoring in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 left-4 z-50 opacity-50 hover:opacity-100 transition-opacity">
              <div className="bg-slate-900/90 backdrop-blur-sm text-xs text-slate-400 px-2 py-1 rounded border border-slate-700/50">
                Dev Mode
              </div>
            </div>
          )}
        </ErrorBoundary>
        
        {/* Service worker registration */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}