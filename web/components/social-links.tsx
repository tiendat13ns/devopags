const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/agnszed/',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] fill-current">
        <path d="M13.5 21v-8h2.75l.41-3.2H13.5V7.76c0-.93.26-1.56 1.6-1.56h1.7V3.34c-.29-.04-1.3-.12-2.48-.12-2.45 0-4.12 1.49-4.12 4.24V9.8H7.43V13h2.77v8h3.3Z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/ag13ns/',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
      </svg>
    ),
  },
];

export function SocialLinks() {
  return (
    <div className="flex items-center gap-2" aria-label="Mạng xã hội">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          className="grid size-9 place-items-center rounded-lg border border-border bg-card text-ink transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Mở ${link.label}`}
          title={link.label}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
