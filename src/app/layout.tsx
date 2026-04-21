import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'
import { GlobalErrorToast } from '@/app/components/GlobalErrorToast'

export const metadata: Metadata = {
  title: 'MoneyFlow - Personal Finance Manager',
  description: 'Track your credits and debits with ease',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <GlobalErrorToast />
        </ThemeProvider>
      </body>
    </html>
  )
}

