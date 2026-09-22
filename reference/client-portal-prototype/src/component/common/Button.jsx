import { Link } from "react-router-dom";

const sizes = {
    sm: "min-h-8 px-3 text-xs",
    md: "min-h-10 px-4 text-sm",
    lg: "min-h-12 px-6 text-sm",
    icon: "h-9 w-9 p-0",
};

const rounds = {
    full: "rounded-full",
    xl: "rounded-xl",
    lg: "rounded-lg",
    md: "rounded-md",
    none: "rounded-none",
};

const variants = {
    solid:
        "bg-brand text-on-brand shadow-lg shadow-brand/25 hover:bg-brand-hover",
    outline: "border border-border bg-transparent text-ink hover:border-brand",
    ghost: "bg-transparent text-ink-secondary hover:bg-surface-soft",
    link: "h-auto min-h-0 bg-transparent px-0 text-muted-soft hover:text-brand",
};

function renderIcon(icon, className = "h-4 w-4") {
    if (!icon) return null;
    if (typeof icon === "function") {
        const Icon = icon;
        return <Icon className={className} aria-hidden />;
    }
    return icon;
}

export function ArrowRightIcon({ className = "h-4 w-4" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={className}
            aria-hidden
        >
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}

export function ArrowLeftIcon({ className = "h-4 w-4" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={className}
            aria-hidden
        >
            <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
    );
}

export default function Button({
    children,
    variant = "solid",
    size = "md",
    rounded = "full",
    bordered,
    underline = false,
    icon,
    iconLeft,
    iconRight,
    iconPosition = "right",
    animate = true,
    to,
    href,
    type = "button",
    disabled = false,
    className = "",
    ...props
}) {
    const leftIcon = iconLeft ?? (iconPosition === "left" ? icon : null);
    const rightIcon = iconRight ?? (iconPosition === "right" ? icon : null);
    const isIconOnly = Boolean((leftIcon || rightIcon) && !children);
    const showBorder = bordered ?? variant === "outline";
    const Tag = to ? Link : href ? "a" : "button";

    const classes = [
        "group inline-flex items-center justify-center gap-2 font-semibold transition duration-300",
        "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        sizes[isIconOnly ? "icon" : size] || sizes.md,
        rounds[rounded] || rounds.full,
        variants[variant] || variants.solid,
        showBorder && variant !== "outline" ? "border border-border" : "",
        !showBorder && variant === "outline" ? "border-transparent hover:border-transparent" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const content = (
        <>
            {leftIcon ? (
                <span
                    className={
                        animate
                            ? "inline-flex shrink-0 transition duration-300 group-hover:-translate-x-0.5"
                            : "inline-flex shrink-0"
                    }
                >
                    {renderIcon(leftIcon)}
                </span>
            ) : null}

            {children ? (
                <span className="relative inline-flex">
                    {children}
                    {underline ? (
                        <span
                            className={
                                animate
                                    ? "pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100"
                                    : "pointer-events-none absolute inset-x-0 -bottom-0.5 h-px bg-current"
                            }
                        />
                    ) : null}
                </span>
            ) : null}

            {rightIcon ? (
                <span
                    className={
                        animate
                            ? "inline-flex shrink-0 transition duration-300 group-hover:translate-x-0.5"
                            : "inline-flex shrink-0"
                    }
                >
                    {renderIcon(rightIcon)}
                </span>
            ) : null}
        </>
    );

    const shared = {
        className: classes,
        ...props,
    };

    if (to) {
        return (
            <Tag to={to} aria-disabled={disabled} {...shared}>
                {content}
            </Tag>
        );
    }

    if (href) {
        return (
            <Tag href={href} aria-disabled={disabled} {...shared}>
                {content}
            </Tag>
        );
    }

    return (
        <button type={type} disabled={disabled} {...shared}>
            {content}
        </button>
    );
}
