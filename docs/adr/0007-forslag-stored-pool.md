# Förslag are stored in a shared DB pool, not scraped live

The Utforska page surfaces Förslag (external recipe discovery cards) to users. The question was whether to scrape external sites on-demand at page-load time or maintain a pre-populated pool in the database.

Live scraping on demand was rejected: it blocks every user page-load on a chain of external HTTP requests, is slow, and makes the feature unavailable whenever a source site is down or slow.

## Considered options

- **Live scraping on demand** *(rejected)*: Fetch and parse external listing pages at page-load time. No DB schema changes needed, but latency is unpredictable and availability depends entirely on external sites.
- **Stored pool, manually triggered scraper** *(chosen — initial phase)*: A scraper fetches Förslag (title + imageUrl + sourceUrl + sourceSite) from external sites and stores them in a `Förslag` DB table. The Utforska page reads from this table. Scraper is invoked manually at first. Stable, fast reads, and decoupled from external availability.
- **Stored pool, scheduled IHostedService** *(planned — follow-up)*: Same as above, but the scraper runs automatically on a daily cadence via `IHostedService`. Deferred to keep the initial implementation simple.

## Scraping strategy per source

Try sitemap.xml or RSS feed first; fall back to HTML category-page scraping if neither is available. Each source is an isolated, swappable implementation.

## Pool size and refresh cadence

~50 Förslag per source (150 total). Full replace on each run — old Förslag for a source are cleared and replaced with fresh ones.

The manual refresh endpoint originally enforced a 30-minute cooldown. This was removed when the Utforska layout switched to a feed-style (single large card, 10 per page) — users exhaust a batch faster and need to refresh more frequently, making the cooldown counterproductive.

## Per-user seen tracking

Each user has a seen-cursor into the shared pool. The Utforska page returns 10 unseen Förslag at a time (reduced from 25 when the layout moved to full-width feed cards). When all are exhausted the cursor resets. This prevents users from hitting a dead end while keeping the pool shared and small.
