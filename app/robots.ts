import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Everything is public, and that includes AI assistants and the search indexes
 * they draw on. Each is named so its operator sees the permission explicitly
 * rather than inferring it from the wildcard: OpenAI (training, ChatGPT search,
 * browsing), Anthropic, Perplexity, Google's Gemini training switch, Apple
 * Intelligence, Microsoft Bing (which ChatGPT search and Copilot also draw on),
 * Meta, Amazon, DuckDuckGo, Mistral, Cohere, You.com and Common Crawl.
 */
const AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
  "YouBot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const allowAll = { allow: "/", disallow: [] as string[] };
  return {
    rules: [
      { userAgent: "*", ...allowAll },
      ...AGENTS.map((userAgent) => ({ userAgent, ...allowAll })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
