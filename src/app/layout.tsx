import type { Metadata } from 'next'
import '@/app/globals.css'
import { APP_NAME, APP_COMPANY } from '@/lib/constants'

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | ${APP_COMPANY}`,
    template: `%s | ${APP_NAME}`,
  },
  description: `Sistem informasi monitoring dan pengelolaan status project ${APP_COMPANY} tahun 2026`,
  keywords: ['project tracker', 'status project', 'PT Energi Unggul Persada', 'monitoring'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-slate-900 bg-grid">
        {children}
      </body>
    </html>
  )
}
