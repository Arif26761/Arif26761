const variants = {
  display:
    "text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl",
  h1: "text-3xl font-bold tracking-tight text-ink sm:text-4xl",
  h2: "text-2xl font-semibold tracking-tight text-ink sm:text-3xl",
  h3: "text-xl font-semibold text-ink sm:text-2xl",
  h4: "text-lg font-semibold text-ink",
  h5: "text-base font-semibold text-ink",
  h6: "text-sm font-semibold uppercase tracking-wide text-ink-secondary",
  lead: "text-lg leading-relaxed text-muted sm:text-xl",
  subtitle: "text-base font-medium text-muted sm:text-lg",
  body: "text-base leading-7 text-muted",
  bodySm: "text-sm leading-6 text-muted",
  caption: "text-xs leading-5 text-muted-soft",
  overline:
    "text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft",
  label: "text-sm font-medium text-ink-secondary",
};

const defaultTags = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  lead: "p",
  subtitle: "p",
  body: "p",
  bodySm: "p",
  caption: "span",
  overline: "span",
  label: "span",
};

export default function Typography({
  as: TagName,
  variant = "body",
  className = "",
  children,
  ...props
}) {
  const Tag = TagName || defaultTags[variant] || "p";
  const classes = `${variants[variant] || variants.body} ${className}`.trim();

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
