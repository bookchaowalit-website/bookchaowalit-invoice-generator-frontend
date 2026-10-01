import type { Metadata } from "next";
import Link from "next/link";
import { projectHost, relatedProjects } from "@/lib/related-projects";

const APP_NAME = "Invoice Generator";
const APP_SLUG = "invoice-generator";

export const metadata: Metadata = {
  title: `Related Projects - ${APP_NAME}`,
  description: "Explore more projects by Bookchaowalit. Discover our collection of web applications and tools.",
  keywords: ["related projects", "more apps", "Bookchaowalit", "web applications"],
  openGraph: {
    title: `Related Projects - ${APP_NAME}`,
    description: "Explore more projects by Bookchaowalit",
    type: "website",
  },
};

export default function RelatedProjectsPage() {
  const categories = relatedProjects(APP_SLUG);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-sm">
          <Link href="/" className="underline underline-offset-4">
            ← Back to {APP_NAME}
          </Link>
        </p>
        <h1 className="mb-4 text-center text-4xl font-bold">More Projects</h1>
        <p className="mb-12 text-center text-gray-600 dark:text-gray-400">
          Explore our collection of web applications and tools
        </p>

        {categories.map((category) => (
          <section className="mb-12" key={category.id} aria-labelledby={`category-${category.id}`}>
            <h2 id={`category-${category.id}`} className="mb-6 text-2xl font-bold">
              {category.label}
            </h2>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.projects.map((project) => (
                <li key={project.slug}>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800"
                  >
                    <span className="mb-2 block text-xl font-semibold">{project.name}</span>
                    <span className="block text-sm text-blue-700 dark:text-blue-300">
                      {projectHost(project.url)} <span aria-hidden="true">→</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
