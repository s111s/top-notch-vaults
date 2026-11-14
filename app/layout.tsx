import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Top Notch Vaults',
  description: 'Run a proven trading strategy from a NEAR vault only you can withdraw from. An AI agent trades it through NEAR Intents, and NEAR AI Cloud signs what it did.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <Providers>
        <Nav />
        <main><div className="wrap">{children}</div></main>
        <footer><div className="wrap">Built at NEAR HACKATHON 2026 on NEAR Intents (1Click), NEAR AI Cloud and NEAR smart contracts. Mainnet, tiny demo sizes. Not financial advice.</div></footer>
      </Providers>
    </body></html>
  );
}
