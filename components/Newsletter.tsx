import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { issues } from "@/lib/newsletter";
import { HOME_ISSUES, NEWSLETTER_NAME, SUBSCRIBE_URL } from "@/lib/writing";

/**
 * The newsletter, Benchmarked: the pitch and a link to every issue on the left, the latest
 * issues on the right. Each issue is its own page at /newsletter/<slug>,
 * served as written (plain links, since those pages sit outside the app's
 * layout); the full list is at /newsletter.
 */
export default function Newsletter() {
  return (
    <section className="mx-auto max-w-6xl scroll-mt-24 px-6 pt-24 sm:pt-28" id="writing">
      <Reveal>
        <div className="glass-card grid overflow-hidden lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="relative p-8 sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(70% 80% at 0% 0%, rgb(249 107 11 / 0.09), transparent 70%)" }}
            />
            <div className="relative">
              <p className="eyebrow">Newsletter</p>
              <h2 className="section-title mt-2">{NEWSLETTER_NAME}.</h2>
              <p className="lead mt-4 max-w-md">
                The AI news, fact-checked. Every number in an issue is labelled with who reported it:
                the company, an independent tester, the press or the community.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {/* a route handler serving plain HTML, not an app page, so a plain link */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/newsletter" className="btn-primary">
                  Read all {issues.length} issues <ArrowRight size={15} />
                </a>
                {SUBSCRIBE_URL && (
                  <a href={SUBSCRIBE_URL} target="_blank" rel="noreferrer" className="btn-glass">
                    Subscribe <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <ul className="border-t hairline lg:border-l lg:border-t-0">
            {issues.slice(0, HOME_ISSUES).map((issue, i) => (
              <li key={issue.slug} className={i > 0 ? "border-t hairline" : ""}>
                <a
                  href={`/newsletter/${issue.slug}`}
                  className="group block p-6 transition-colors hover:bg-fill sm:px-8"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="token">{issue.date}</span>
                    <span className="footnote">
                      {issue.kind}
                      {issue.minutes && ` · ${issue.minutes} min read`}
                    </span>
                  </div>
                  <h3 className="headline mt-3 flex items-start justify-between gap-3 !text-[1.0625rem]">
                    {issue.title}
                    <ArrowUpRight
                      size={16}
                      aria-hidden
                      className="mt-1 flex-none text-label-3 transition-[color,translate] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-[1.5] text-label-2">{issue.dek}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
