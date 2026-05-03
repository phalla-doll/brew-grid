import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Homebrew Directory | Premium Package Grid',
  description: 'Explore, search, and discover over 7,000 macOS packages. The premium grid directory built for developers.',
  keywords: ['Homebrew', 'macOS', 'packages', 'developer tools', 'brew', 'directory', 'grid', 'CLI'],
  authors: [{ name: 'Brew Directory' }],
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍺</text></svg>',
  },
  openGraph: {
    title: 'Homebrew Directory | Premium Package Grid',
    description: 'Explore, search, and discover over 7,000 macOS packages in a premium dark-aesthetic grid.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Homebrew Directory',
    description: 'Explore, search, and discover over 7,000 macOS packages.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&f[]=clash-display@200,400,700,500,600,300&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fontsource/commit-mono/index.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="bg-[#050505] text-white font-sans antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
