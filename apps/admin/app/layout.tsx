import './globals.css'

export const metadata = {
  title: 'Buildown - Platform',
  description: 'Complete AI-Powered Platform for Modern Businesses',
  icons: {
    icon: '/bod_favicon.png',
    shortcut: '/bod_favicon.png',
    apple: '/bod_favicon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/bod_favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/bod_favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
