import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'AllezIA - Rapports de maintenance',
  description: 'Application professionnelle de génération de formulaires pour TaskIA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}