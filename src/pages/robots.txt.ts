/**
 * @fileoverview Robots.txt Dynamic Route
 *
 * Generates a robots.txt file that implements the same anti-crawler policy
 * as the meta tags in the HTML head. This provides server-level protection
 * against search engine crawlers and bots attempting to index the site.
 *
 * Features:
 * - Disallows all user agents from accessing any content
 * - Blocks all major search engine crawlers
 * - Blocks social media and messaging platform bots
 * - Provides comprehensive site protection
 * - Returns proper text/plain content type
 *
 * Anti-Crawler Policy:
 * - Disallow: / (blocks all paths for all user agents)
 * - Explicitly blocks major search engines (Google, Bing, Yahoo, etc.)
 * - Blocks social media crawlers (Facebook, Twitter, LinkedIn, etc.)
 * - Blocks messaging platform bots (WhatsApp, Telegram, Discord, etc.)
 * - Blocks international search engines (Yandex, Baidu)
 *
 * Usage:
 * - Automatically served at /robots.txt
 * - Crawlers check this file before indexing
 * - Works in conjunction with HTML meta tags
 * - Provides defense-in-depth approach
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

import type { APIRoute } from 'astro'

export const prerender = true

/**
 * GET handler for robots.txt route
 *
 * Generates a comprehensive robots.txt file that blocks all crawlers
 * and implements the same anti-indexing policy as the site's meta tags.
 *
 * @returns Response object with robots.txt content and proper headers
 */
export const GET: APIRoute = () => {
  const robotsTxt = `# Robots.txt - Anti-Crawler Policy
# This site is private and should not be indexed by search engines or crawlers

# Block all user agents from accessing any content
User-agent: *
Disallow: /

# Explicitly block major search engine crawlers
User-agent: Googlebot
Disallow: /

User-agent: Bingbot
Disallow: /

User-agent: Slurp
Disallow: /

User-agent: DuckDuckBot
Disallow: /

User-agent: YandexBot
Disallow: /

User-agent: Baiduspider
Disallow: /

# Block social media and messaging platform crawlers
User-agent: facebookexternalhit
Disallow: /

User-agent: Twitterbot
Disallow: /

User-agent: LinkedInBot
Disallow: /

User-agent: WhatsApp
Disallow: /

User-agent: TelegramBot
Disallow: /

User-agent: DiscordBot
Disallow: /

User-agent: Applebot
Disallow: /

# Additional common crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: ia_archiver
Disallow: /

# No sitemap provided as we don't want any indexing
`

  return new Response(robotsTxt)
}
