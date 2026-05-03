import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brew Grid',
  description: 'A premium grid directory of Homebrew libraries',
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
