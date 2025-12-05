import type React from "react"
// This layout generates a timestamp at build/regeneration time
// This simulates dynamic navigation data that should be revalidated

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Generate timestamp at build/regeneration time
  const layoutTimestamp = Date.now()

  return (
    <div>
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Cache Revalidation Bug Demo</h1>
          <p className="text-sm text-foreground/60">Locale: {locale}</p>
          <div className="mt-2 rounded bg-background px-3 py-2 text-sm">
            <div className="font-semibold text-foreground">Navigation Data Timestamp (Layout):</div>
            <div className="font-mono text-primary">{new Date(layoutTimestamp).toISOString()}</div>
            <div className="text-xs text-foreground/60">Unix: {layoutTimestamp}</div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
