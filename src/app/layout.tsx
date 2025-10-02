import type { Metadata } from 'next'
import './globals.scss'
import { ToastProvider } from '@/components/ToastProvider'

export const metadata: Metadata = {
  title: 'Agendador',
  description: 'Agenda de tarefas e eventos'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
