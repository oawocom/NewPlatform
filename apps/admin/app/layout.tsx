import './globals.css'

export const metadata = {
  title: 'Platform Admin',
  description: 'Professional SaaS Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
