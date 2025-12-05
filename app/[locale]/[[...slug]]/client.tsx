"use client"

import { useState } from "react"

// Slug normalization logic from the bug report
const normalizeSlug = (slug: string[] | string | undefined) =>
  Array.isArray(slug) ? `/${slug.join("/")}` : `/${slug || ""}`.replace(/\/{2}/g, "/").trim()

// Client component that handles the interactive parts
export function RevalidationTestUI({
  locale,
  normalizedSlug,
  pageTimestamp,
}: {
  locale: string
  normalizedSlug: string
  pageTimestamp: number
}) {
  const [revalidatePath, setRevalidatePath] = useState("/")
  const [apiResponse, setApiResponse] = useState<{
    success: boolean
    message: string
    timestamp: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRevalidate = async (path: string) => {
    setIsLoading(true)
    setApiResponse(null)

    try {
      const response = await fetch("/api/revalidate/path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      })

      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      setApiResponse({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Page Info */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Current Page Information</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold text-foreground">Locale:</span>{" "}
            <span className="font-mono text-primary">{locale}</span>
          </div>
          <div>
            <span className="font-semibold text-foreground">Normalized Slug:</span>{" "}
            <span className="font-mono text-primary">{normalizedSlug}</span>
          </div>
          <div>
            <span className="font-semibold text-foreground">Current URL:</span>{" "}
            <span className="font-mono text-primary">
              {typeof window !== "undefined" ? window.location.pathname : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Page Timestamp */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Page Generation Timestamp</h2>
        <div className="space-y-2 rounded bg-background px-4 py-3">
          <div className="font-mono text-lg text-success">{new Date(pageTimestamp).toISOString()}</div>
          <div className="text-xs text-foreground/60">Unix: {pageTimestamp}</div>
          <div className="mt-2 text-xs text-foreground/60">
            This timestamp shows when the page was last built or regenerated. If revalidation works, this should update
            after calling the API and refreshing.
          </div>
        </div>
      </div>

      {/* Revalidation Test Interface */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Test Cache Revalidation</h2>

        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium text-foreground">Path to Revalidate:</label>
          <input
            type="text"
            value={revalidatePath}
            onChange={(e) => setRevalidatePath(e.target.value)}
            className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="/de"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleRevalidate(revalidatePath)}
            disabled={isLoading}
            className="w-full rounded bg-primary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Revalidating..." : "Revalidate Path"}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleRevalidate("/de")}
              disabled={isLoading}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-card disabled:opacity-50"
            >
              Revalidate /de
            </button>
            <button
              onClick={() => handleRevalidate("/de/about")}
              disabled={isLoading}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-card disabled:opacity-50"
            >
              Revalidate /de/about
            </button>
          </div>
        </div>

        {apiResponse && (
          <div
            className={`mt-4 rounded border p-4 ${
              apiResponse.success ? "border-success/20 bg-success/5" : "border-error/20 bg-error/5"
            }`}
          >
            <div className="mb-2 font-semibold text-foreground">API Response:</div>
            <div className={`text-sm ${apiResponse.success ? "text-success" : "text-error"}`}>
              {apiResponse.message}
            </div>
            <div className="mt-2 text-xs text-foreground/60">
              API Called at: {new Date(apiResponse.timestamp).toISOString()}
            </div>
            {apiResponse.success && (
              <div className="mt-3 rounded bg-background p-3 text-xs text-foreground/80">
                <strong>Next Step:</strong> Wait 1-2 seconds, then refresh this page. If the timestamps above update,
                revalidation worked. If they stay the same, the bug is reproduced.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bug Explanation */}
      <div className="rounded-lg border border-error/20 bg-error/5 p-6">
        <h2 className="mb-3 text-lg font-semibold text-error">Expected Bug Behavior</h2>
        <div className="space-y-2 text-sm text-foreground">
          <p>
            <strong>The Issue:</strong> When using catch-all routes with empty slug parameters and redirects,{" "}
            <code className="rounded bg-background px-1 py-0.5">revalidatePath("/")</code> and{" "}
            <code className="rounded bg-background px-1 py-0.5">revalidatePath("/de")</code> fail to invalidate the
            cache.
          </p>
          <p>
            <strong>Test:</strong> Click "Revalidate /" or "Revalidate /de", wait a moment, then refresh. The timestamps
            should NOT update (demonstrating the bug).
          </p>
          <p>
            <strong>Comparison:</strong> Visit /de/about, then click "Revalidate /de/about". The timestamps WILL update
            correctly for non-empty slugs.
          </p>
        </div>
      </div>
    </div>
  )
}
