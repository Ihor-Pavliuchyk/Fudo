import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Fudo — смачно їж, менше витрачай',
  description: 'Fudo — студентський проєкт вигідних пропозицій їжі, карти магазинів та групових замовлень.',
  icons: { icon: '/brand/fudo-icon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uk"><body><SiteHeader />{children}</body></html>;
}
