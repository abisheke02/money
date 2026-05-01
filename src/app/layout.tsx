import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'
import { GlobalErrorToast } from '@/app/components/GlobalErrorToast'

export const metadata: Metadata = {
  title: 'MoneyFlow',
  description: 'Personal Finance Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <GlobalErrorToast />
        </ThemeProvider>
      </body>
    </html>
  )
}
