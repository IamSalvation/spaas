import { Providers } from './providers';
import './global.css';

export const metadata = {
  title: 'SPAAS ERP',
  description: 'Software and Product As A Service',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}