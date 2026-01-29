import './globals.css'
import Navbar from './components/Navbar'
import { ReactNode } from 'react'


export const metadata = {
  title: 'Gabot',
  description: 'El bot que te escucha',
}
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
