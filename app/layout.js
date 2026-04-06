import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'FormIA - Générateur de formulaires',
  description: 'Application professionnelle de génération de formulaires pour TaskIA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}