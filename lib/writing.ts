/**
 * The newsletter's name and signup. Issues come from the Benchmarked repo
 * via scripts/sync-newsletter.mjs (see lib/newsletter.ts). To collect
 * subscribers with a provider, set SUBSCRIBE_URL to its signup page and a
 * Subscribe button appears next to "Read all issues".
 */
export const NEWSLETTER_NAME = "Benchmarked";
export const SUBSCRIBE_URL: string | null = null;

/** how many issues the homepage lists before "All issues" */
export const HOME_ISSUES = 4;
