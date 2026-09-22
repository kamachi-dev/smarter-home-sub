import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smarter Home Sub Controller',
  description: 'Next.js Sub-Controller Service for dual GPIO/IP sensor management & Supabase Realtime streaming',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang=" en\>
 <body>{children}</body>
 </html>
 );
}
