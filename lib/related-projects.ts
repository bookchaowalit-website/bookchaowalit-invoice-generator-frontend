export type RelatedProject = { name: string; url: string; slug: string };
export type ProjectCategory = { id: string; label: string; projects: RelatedProject[] };

/** Catalog of sibling Bookchaowalit apps shown on /more-projects. */
export const PROJECT_CATEGORIES: ProjectCategory[] = [
  {
    id: "productivity",
    label: "Productivity",
    projects: [
      { name: "Pomodoro Timer", url: "https://bookchaowalit-pomodoro-timer-fronte.vercel.app", slug: "pomodoro-timer" },
      { name: "Habit Tracker", url: "https://bookchaowalit-habit-tracker-frontend.vercel.app", slug: "habit-tracker" },
      { name: "Goal Tracker", url: "https://bookchaowalit-goal-tracker-frontend.vercel.app", slug: "goal-tracker" },
      { name: "Time Tracker", url: "https://bookchaowalit-time-tracker-frontend.vercel.app", slug: "time-tracker" },
      { name: "Todo Board", url: "https://bookchaowalit-todo-board-frontend.vercel.app", slug: "todo-board" },
      { name: "Calendar App", url: "https://bookchaowalit-calendar-app-frontend.vercel.app", slug: "calendar-app" },
      { name: "Reminders", url: "https://bookchaowalit-reminders-frontend.vercel.app", slug: "reminders" },
    ],
  },
  {
    id: "dev-tools",
    label: "Dev tools",
    projects: [
      { name: "JSON Converter", url: "https://bookchaowalit-jsonconverter-frontend.vercel.app", slug: "json-converter" },
      { name: "Base64 Encoder", url: "https://bookchaowalit-base64-frontend.vercel.app", slug: "base64" },
      { name: "Regex Tester", url: "https://bookchaowalit-regex-frontend.vercel.app", slug: "regex" },
      { name: "Hash Generator", url: "https://bookchaowalit-hashgen-frontend.vercel.app", slug: "hashgen" },
      { name: "Cron Expression", url: "https://bookchaowalit-cron-frontend.vercel.app", slug: "cron" },
      { name: "Diff Checker", url: "https://bookchaowalit-diffchecker-frontend.vercel.app", slug: "diffchecker" },
      { name: "Minifier", url: "https://bookchaowalit-minifier-frontend.vercel.app", slug: "minifier" },
      { name: "URL Encoder", url: "https://bookchaowalit-url-encoder-frontend.vercel.app", slug: "url-encoder" },
      { name: "URL Shortener", url: "https://bookchaowalit-url-shortener-frontend.vercel.app", slug: "url-shortener" },
      { name: "Deep Links", url: "https://bookchaowalit-deeplinks-frontend.vercel.app", slug: "deeplinks" },
    ],
  },
  {
    id: "content-tools",
    label: "Content tools",
    projects: [
      { name: "Markdown Editor", url: "https://bookchaowalit-markdown-editor-frontend.vercel.app", slug: "markdown-editor" },
      { name: "Text Summarizer", url: "https://bookchaowalit-text-summarizer-frontend.vercel.app", slug: "text-summarizer" },
      { name: "Quote Generator", url: "https://bookchaowalit-quote-generator-front.vercel.app", slug: "quote-generator" },
      { name: "Meme Generator", url: "https://bookchaowalit-meme-generator-frontend.vercel.app", slug: "meme-generator" },
      { name: "Number Converter", url: "https://bookchaowalit-number-converter-frontend.vercel.app", slug: "number-converter" },
      { name: "Date Calculator", url: "https://bookchaowalit-date-calculator-frontend.vercel.app", slug: "date-calculator" },
    ],
  },
  {
    id: "webmaster",
    label: "Webmaster",
    projects: [
      { name: "SEO Analyzer", url: "https://bookchaowalit-seo-analyzer-frontend.vercel.app", slug: "seo-analyzer" },
      { name: "Analytics Dashboard", url: "https://bookchaowalit-analytics-dashboard-frontend.vercel.app", slug: "analytics-dashboard" },
      { name: "Uptime Monitor", url: "https://bookchaowalit-uptime-monitor-frontend.vercel.app", slug: "uptime-monitor" },
      { name: "Error Logs", url: "https://bookchaowalit-error-logs-frontend.vercel.app", slug: "error-logs" },
      { name: "Redirect Manager", url: "https://bookchaowalit-redirect-manager-frontend.vercel.app", slug: "redirect-manager" },
      { name: "Status Page", url: "https://bookchaowalit-status-frontend.vercel.app", slug: "status" },
      { name: "Popular Pages", url: "https://bookchaowalit-popular-pages-frontend.vercel.app", slug: "popular-pages" },
      { name: "Link Analytics", url: "https://bookchaowalit-link-analytics-frontend.vercel.app", slug: "link-analytics" },
      { name: "Webhook Tester", url: "https://bookchaowalit-webhook-tester-frontend.vercel.app", slug: "webhook-tester" },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    projects: [
      { name: "Contact Forms", url: "https://bookchaowalit-contact-forms-frontend.vercel.app", slug: "contact-forms" },
      { name: "Newsletter", url: "https://bookchaowalit-newsletter-frontend.vercel.app", slug: "newsletter" },
      { name: "Comments", url: "https://bookchaowalit-comments-frontend.vercel.app", slug: "comments" },
      { name: "Guestbook", url: "https://bookchaowalit-guestbook-frontend.vercel.app", slug: "guestbook" },
      { name: "Chat Playground", url: "https://bookchaowalit-chat-playground-frontend.vercel.app", slug: "chat-playground" },
    ],
  },
  {
    id: "main",
    label: "Main sites",
    projects: [
      { name: "Portfolio", url: "https://bookchaowalit.com", slug: "portfolio" },
      { name: "Blog", url: "https://bookchaowalit-techblog-frontend.vercel.app", slug: "techblog" },
      { name: "DevHub", url: "https://bookchaowalit-devhub-frontend.vercel.app", slug: "devhub" },
      { name: "Wiki", url: "https://bookchaowalit-wiki-frontend.vercel.app", slug: "wiki" },
      { name: "TechSpace", url: "https://bookchaowalit-techspace-frontend.vercel.app", slug: "techspace" },
      { name: "Tracking", url: "https://bookchaowalit-tracking-frontend.vercel.app", slug: "tracking" },
      { name: "Linktree", url: "https://bookchaowalit-linktree-frontend.vercel.app", slug: "linktree" },
    ],
  },
];

/**
 * Returns the catalog without the current app and without empty categories,
 * so a page never links back to itself as a "related" project.
 */
export function relatedProjects(currentSlug: string, categories: ProjectCategory[] = PROJECT_CATEGORIES): ProjectCategory[] {
  return categories
    .map((category) => ({ ...category, projects: category.projects.filter((project) => project.slug !== currentSlug) }))
    .filter((category) => category.projects.length > 0);
}

/** Display host for a project URL, e.g. "bookchaowalit.com". */
export function projectHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
