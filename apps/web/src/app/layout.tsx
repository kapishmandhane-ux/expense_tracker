import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { QueryProvider } from '../components/query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spendy — Personal Expense & Budget Management',
  description:
    'Ultra-low friction, real-time cross-platform expense and budget tracking with a frosted glass aesthetic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-slate-100 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300 relative overflow-x-hidden selection:bg-indigo-500/30`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            {/* Ambient Glow Gradients */}
            <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/15 dark:bg-indigo-600/20 blur-[128px] pointer-events-none -z-10 animate-pulse-slow" />
            <div className="fixed top-1/3 -right-40 w-96 h-96 rounded-full bg-sky-400/15 dark:bg-sky-500/15 blur-[128px] pointer-events-none -z-10 animate-pulse-slow" />
            <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-pink-400/10 dark:bg-pink-600/15 blur-[128px] pointer-events-none -z-10 animate-pulse-slow" />

            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
