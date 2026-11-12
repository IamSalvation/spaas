import { Providers } from './providers';
import './global.css';

export const metadata = {
  title: 'SPAAS ERP',
  description: 'Software and Product As A Service',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-spaas-navy text-gray-900 dark:text-white transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}