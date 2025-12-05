# Next.js Cache Revalidation Bug Reproduction

This repository demonstrates a cache revalidation bug in Next.js when using catch-all routes with empty slug parameters and redirects.

## The Bug

When using a catch-all route pattern like `[[...slug]]` combined with redirects from `/` to a locale path (e.g., `/de`), calling `revalidatePath("/")` or `revalidatePath("/de")` fails to invalidate the cache for routes with empty slugs. However, revalidation works correctly for routes with non-empty slugs.

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd nextjs-cache-revalidation-bug

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
\`\`\`

Visit `http://localhost:3000` (will redirect to `/de`)

### Vercel Deployment

1. Push this repository to GitHub
2. Import the project in Vercel
3. Deploy with default settings
4. Visit your deployment URL

## Project Structure

\`\`\`
app/
├── layout.tsx                    # Root passthrough layout
├── globals.css                   # Tailwind styles
├── [locale]/
│   ├── layout.tsx               # Locale layout with timestamp
│   └── [[...slug]]/
│       └── page.tsx             # Catch-all route with test UI
└── api/
    └── revalidate/
        └── path/
            └── route.ts         # Revalidation API endpoint
\`\`\`

## How to Reproduce the Bug

### Step-by-Step Instructions

1. **Deploy to Vercel** (the bug is most apparent on Vercel's infrastructure)
   
2. **Visit the root URL** `/` → You'll be redirected to `/de`

3. **Note the timestamps:**
   - Navigation Data Timestamp (from layout)
   - Page Generation Timestamp (from page component)
   - Write these down or take a screenshot

4. **Test the bug:**
   - Click "Revalidate /" button
   - Wait 2 seconds for revalidation to complete
   - Refresh the page
   - **BUG:** The timestamps remain unchanged (cache was not invalidated)

5. **Try alternative path:**
   - Click "Revalidate /de" button
   - Wait 2 seconds
   - Refresh the page
   - **BUG:** The timestamps still remain unchanged

6. **Test with non-empty slug (working case):**
   - Navigate to `/de/about`
   - Note the timestamps
   - Click "Revalidate /de/about" button
   - Wait 2 seconds
   - Refresh the page
   - **WORKS:** The timestamps update correctly

## Understanding the Timestamps

### What Each Timestamp Represents

- **Navigation Data Timestamp (Layout):** Generated in `app/[locale]/layout.tsx` at build/regeneration time. Simulates dynamic navigation data.
  
- **Page Generation Timestamp:** Generated in `app/[locale]/[[...slug]]/page.tsx` at build/regeneration time. Shows when the page was last built.

- **API Called at:** Shows when the revalidation API was triggered.

### How to Verify Revalidation

**Revalidation Worked:**
- Both timestamps update to new values after refresh
- New values are close to the "API Called at" timestamp

**Revalidation Failed (Bug):**
- Timestamps remain the same after refresh
- Values are older than the "API Called at" timestamp

## Technical Details

### Configuration

**next.config.ts:**
\`\`\`typescript
redirects: async () => [
  {
    source: "/",
    destination: "/de",
    permanent: false,
  },
]
\`\`\`

**Slug Normalization:**
\`\`\`typescript
const normalizeSlug = (slug: string[] | string | undefined) =>
  Array.isArray(slug)
    ? `/${slug.join("/")}`
    : `/${slug || ""}`.replace(/\/{2}/g, "/").trim();
\`\`\`

When `slug` is `undefined`, this normalizes to `/`, which creates the problematic empty slug scenario.

### ISR Configuration

- `export const revalidate = 60` - Pages revalidate every 60 seconds
- On-demand revalidation via `revalidatePath()` API

## Expected vs Actual Behavior

### Expected Behavior

1. `revalidatePath("/")` should invalidate cache for `/de` (since `/` redirects to `/de`)
2. `revalidatePath("/de")` should invalidate cache for `/de` 
3. Timestamps should update after revalidation and refresh

### Actual Behavior (Bug)

1. `revalidatePath("/")` does NOT invalidate cache for `/de`
2. `revalidatePath("/de")` does NOT invalidate cache for `/de`
3. Timestamps remain unchanged, cache persists
4. Only works for non-empty slugs like `/de/about`

## Root Cause Analysis

The bug occurs due to the interaction between:

1. **Catch-all route with optional segments:** `[[...slug]]`
2. **Empty slug parameter:** `slug: undefined` → normalizes to `/`
3. **Redirect from root:** `/` → `/de`
4. **Cache key mismatch:** `revalidatePath("/")` and `revalidatePath("/de")` don't match the internal cache key for the catch-all route with empty slug

## Testing Checklist

### Local Testing
- [ ] `npm run build && npm start`
- [ ] Visit `http://localhost:3000`
- [ ] Test revalidation for `/`, `/de`, and `/de/about`
- [ ] Compare timestamp behavior

### Vercel Testing
- [ ] Deploy to Vercel
- [ ] Visit deployment URL
- [ ] Test revalidation for `/`, `/de`, and `/de/about`
- [ ] Check cache headers in browser DevTools (x-vercel-cache)
- [ ] Verify timestamps update or remain unchanged

### Browser DevTools Headers
Check the Network tab for:
- `x-vercel-cache: HIT` - Served from cache
- `x-vercel-cache: MISS` - Generated fresh (revalidation worked)

## Workarounds

Until this bug is fixed, potential workarounds include:

1. **Avoid empty slug catch-all routes with redirects**
2. **Use explicit routing** instead of catch-all for root locale paths
3. **Revalidate specific paths** with actual slug values instead of root paths

## Environment

- Next.js: 16.0.7
- React: 19.0.0
- Node.js: 20+

## License

MIT
