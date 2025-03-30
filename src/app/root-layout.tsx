import { Metadata } from 'next';
import ClientLayout from './layout';

export const metadata: Metadata = {
  title: 'Degen D. Clash',
  description: 'An NFT battle game on the Sui blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
} 