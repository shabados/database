import type { Metadata } from 'next'
import { Inter, Noto_Sans_Gurmukhi } from 'next/font/google'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const gurmukhi = Noto_Sans_Gurmukhi({
  subsets: ['gurmukhi'],
  variable: '--font-gurmukhi',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Giaan Khand',
  description: 'Search Sikh scripture with a premium pangti-first browsing experience.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${gurmukhi.variable}`}>
      <body>{children}</body>
    </html>
  )
}
