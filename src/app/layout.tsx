import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
 title: { default: 'Ademis Horti', template: '%s | Ademis Horti' },
 description: 'Gestão do campo ao cliente. Uma solução da Akilli Brasil.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="pt-BR"><body>{children}</body></html>;
}
