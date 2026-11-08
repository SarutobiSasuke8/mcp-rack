import { SITE, absolute } from './site';

type Json = Record<string, unknown>;

export function personSchema(siteUrl: URL | undefined): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.owner.name,
    alternateName: SITE.owner.handle,
    url: SITE.owner.url,
    sameAs: [SITE.owner.github, SITE.owner.x, SITE.owner.linkedin],
    jobTitle: 'Head of Marketing and MCP server author',
    knowsAbout: ['Model Context Protocol', 'AI agents', 'GIMP automation', 'Developer tools'],
    mainEntityOfPage: absolute('/about', siteUrl),
  };
}

export function websiteSchema(siteUrl: URL | undefined): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: absolute('/', siteUrl),
    description: SITE.description,
    inLanguage: SITE.language,
    author: { '@type': 'Person', name: SITE.owner.name, url: SITE.owner.url },
  };
}

export interface ServerLike {
  slug: string;
  name: string;
  tagline: string;
  lang: string;
  license: string;
  repo: string | null;
  version?: string | null;
  package?: { kind: string; name: string; version?: string | null } | null;
}

export function softwareSchema(server: ServerLike, siteUrl: URL | undefined): Json {
  const schema: Json = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: server.name,
    description: server.tagline,
    ...(server.repo ? { codeRepository: server.repo } : {}),
    programmingLanguage: server.lang,
    license: `https://spdx.org/licenses/${server.license}.html`,
    author: { '@type': 'Person', name: SITE.owner.name, url: SITE.owner.url },
    url: absolute(`/servers/${server.slug}`, siteUrl),
    keywords: 'MCP server, Model Context Protocol, AI agents',
  };
  if (server.package?.version) schema.version = server.package.version;
  return schema;
}

export function itemListSchema(servers: ServerLike[], siteUrl: URL | undefined): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `MCP servers by ${SITE.owner.name}`,
    itemListElement: servers.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absolute(`/servers/${s.slug}`, siteUrl),
      name: s.name,
    })),
  };
}

export function articleSchema(
  post: { slug: string; title: string; description: string; pubDate: Date; updatedDate?: Date; image?: string },
  siteUrl: URL | undefined,
): Json {
  const url = absolute(`/blog/${post.slug}`, siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.description,
    datePublished: post.pubDate.toISOString(),
    dateModified: (post.updatedDate ?? post.pubDate).toISOString(),
    inLanguage: SITE.language,
    url,
    mainEntityOfPage: url,
    image: post.image ? absolute(post.image, siteUrl) : absolute(SITE.defaultOgImage, siteUrl),
    author: { '@type': 'Person', name: SITE.owner.name, url: SITE.owner.url },
    publisher: { '@type': 'Person', name: SITE.owner.name, url: SITE.owner.url },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[], siteUrl: URL | undefined): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(item.path, siteUrl),
    })),
  };
}

/**
 * FAQPage for a page that genuinely answers these questions in its visible copy.
 * Google requires the question and answer text to appear on the page itself, so every
 * entry here must track the rendered content. Rich results for FAQPage are now limited
 * to a narrow set of sites, but the markup still gives assistants and answer engines a
 * clean, unambiguous read of the policy.
 */
export function faqSchema(entries: { question: string; answer: string }[], siteUrl: URL | undefined, path: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: absolute(path, siteUrl),
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

/** The maturity vocabulary, so an agent can resolve a status label without scraping prose. */
export function definedTermSetSchema(
  terms: { name: string; description: string; id: string }[],
  siteUrl: URL | undefined,
  path: string,
): Json {
  const setUrl = absolute(path, siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: `${SITE.name} maturity labels`,
    url: setUrl,
    hasDefinedTerm: terms.map((term) => ({
      '@type': 'DefinedTerm',
      name: term.name,
      description: term.description,
      url: `${setUrl}#${term.id}`,
      inDefinedTermSet: setUrl,
    })),
  };
}

export function blogSchema(
  posts: { slug: string; title: string; description: string; pubDate: Date }[],
  siteUrl: URL | undefined,
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE.name} · Journal`,
    url: absolute('/blog', siteUrl),
    description: 'Practical MCP guides, field notes and release notes.',
    inLanguage: SITE.language,
    author: { '@type': 'Person', name: SITE.owner.name, url: SITE.owner.url },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.pubDate.toISOString(),
      url: absolute(`/blog/${post.slug}`, siteUrl),
    })),
  };
}

/** A plain WebPage node for pages that are not an article, a server or a listing. */
export function webPageSchema(
  page: { name: string; description: string; path: string },
  siteUrl: URL | undefined,
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: absolute(page.path, siteUrl),
    inLanguage: SITE.language,
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: absolute('/', siteUrl) },
  };
}
