import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'منظومة إدارة وتتبع التبرعات والحملات الخيرية | Donation ERP & Portal',
  description: 'منصة سحابية لإدارة وتتبع التبرعات، كفالة الأيتام، الحملات الخيرية، ومتابعة دورات السداد اليومية.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-cairo antialiased">
        {children}
      </body>
    </html>
  );
}
