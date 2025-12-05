import { RevalidationTestUI } from "./client"

// Slug normalization logic from the bug report
const normalizeSlug = (slug: string[] | string | undefined) =>
  Array.isArray(slug) ? `/${slug.join("/")}` : `/${slug || ""}`.replace(/\/{2}/g, "/").trim()

// Main page component - this is a Server Component
export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>
}) {
  const { locale, slug } = await params

  // Generate timestamp at build/regeneration time
  const pageTimestamp = Date.now()

  // Normalize the slug
  const normalizedSlug = normalizeSlug(slug)

  return <RevalidationTestUI locale={locale} normalizedSlug={normalizedSlug} pageTimestamp={pageTimestamp} />
}

// Configure ISR with 60 second revalidation
export const revalidate = 60

// Generate static params for common routes
export async function generateStaticParams() {
  return [
    { locale: "de", slug: undefined },
    { locale: "de", slug: ["about"] },
    { locale: "en", slug: undefined },
  ]
}
