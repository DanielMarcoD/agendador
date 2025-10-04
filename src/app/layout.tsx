import type { Metadata } from 'next'
import './globals.scss'
import '../styles/datepicker.css'
import { ToastProvider } from '@/components/ToastProvider'
import { TokenManager } from '@/components/TokenManager'

export const metadata: Metadata = {
  title: 'Agendador',
  description: 'Agenda de tarefas e eventos'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <TokenManager>
          <ToastProvider>{children}</ToastProvider>
        </TokenManager>
      </body>
    </html>
  )
}
