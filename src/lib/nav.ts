export interface NavItem {
  label: string;
  href: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Servers', href: '/servers' },
  { label: 'Curated rack', href: '/rack' },
  { label: 'Journal', href: '/blog' },
  { label: 'For agents', href: '/agents' },
  { label: 'About', href: '/about' },
];

export const FOOTER_GROUPS: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    heading: 'Site',
    links: [
      { label: 'Servers', href: '/servers' },
      { label: 'Curated rack', href: '/rack' },
      { label: 'Journal', href: '/blog' },
      { label: 'For agents', href: '/agents' },
  { label: 'About', href: '/about' },
      { label: 'RSS feed', href: '/rss.xml' },
      { label: 'Listing standards', href: '/standards' },
      { label: 'Suggest a server', href: '/submit' },
      { label: 'catalog.json', href: '/catalog.json' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
];

/** Most-specific match wins so /blog/x still marks Release notes as current. */
export function isCurrent(itemHref: string, pathname: string, base: string): boolean {
  const clean = pathname.replace(/\/$/, '') || '/';
  const target = `${base}${itemHref}`.replace(/\/$/, '');
  return clean === target || clean.startsWith(`${target}/`);
}
