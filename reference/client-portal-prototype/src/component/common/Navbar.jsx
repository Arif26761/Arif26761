import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../../context/languageContext";
import { useTheme } from "../../context/themeContext";
import { useToast } from "./Toaster";
import { containerClass, useBreakpoint } from "../../utils/responsive";
import Button from "./Button";
import Modal from "./Modal";
import DynamicPrefText from "./preference/DynamicPrefText";
import DynamicPrefNumber from "./preference/DynamicPrefNumber";
import Typography from "./Text";

const FLAG_UK = "https://flagcdn.com/w40/gb.png";
const FLAG_BD = "https://flagcdn.com/w40/bd.png";

function LanguageToggle({ language, onToggle }) {
    const isBn = language === "bn";

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label="Toggle language"
            className="relative isolate flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border border-border bg-surface-soft p-0.5 sm:w-26"
        >
            <span aria-hidden className="absolute inset-0.5 grid grid-cols-2">
                <span
                    className={`rounded-full bg-brand shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isBn ? "translate-x-full" : "translate-x-0"
                        }`}
                />
            </span>
            <span className="relative z-10 grid w-full grid-cols-2 items-center">
                <span
                    className={`flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors duration-300 sm:text-xs ${isBn ? "text-muted" : "text-on-brand"
                        }`}
                >
                    <img
                        src={FLAG_UK}
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4 rounded-full object-cover ring-1 ring-black/10"
                    />
                    <span className="hidden sm:inline">EN</span>
                </span>
                <span
                    className={`flex items-center justify-center gap-1 text-[10px] font-semibold transition-colors duration-300 sm:text-xs ${isBn ? "text-on-brand" : "text-muted"
                        }`}
                >
                    <img
                        src={FLAG_BD}
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4 rounded-full object-cover ring-1 ring-black/10"
                    />
                    <span className="hidden sm:inline">বাং</span>
                </span>
            </span>
        </button>
    );
}

export default function Navbar() {
    const { t, language, toggleLanguage } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const { isMobile } = useBreakpoint();
    const [open, setOpen] = useState(false);
    const [prefOpen, setPrefOpen] = useState(false);

    const links = [
        { to: "/", label: t("nav.home") },
        { to: "/", label: t("nav.products") },
        { to: "/", label: t("nav.support") },
    ];

    const onTheme = () => {
        toggleTheme();
        showToast(isDark ? t("toast.themeLight") : t("toast.themeDark"), {
            type: "success",
        });
    };

    const onLanguage = () => {
        toggleLanguage();
        showToast(t("toast.language"), { type: "info" });
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-xl">
            <div className={`${containerClass} flex h-16 items-center justify-between gap-4`}>
                <Link to="/" className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-sm font-bold text-on-brand">
                        F
                    </span>
                    <Typography as="span" variant="h5">
                        {t("brand")}
                    </Typography>
                </Link>

                {!isMobile ? (
                    <nav className="flex items-center gap-6">
                        {links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.to}
                                className="text-sm font-medium text-muted transition hover:text-brand"
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                ) : null}

                <div className="flex items-center gap-2">
                    <LanguageToggle language={language} onToggle={onLanguage} />
                    <Button
                        variant="outline"
                        size="icon"
                        animate={false}
                        onClick={() => setPrefOpen(true)}
                        aria-label={t("pref.title")}
                    >
                        Aa
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        animate={false}
                        onClick={onTheme}
                        aria-label="Toggle theme"
                    >
                        {isDark ? "☀" : "☾"}
                    </Button>
                    {!isMobile ? (
                        <Button to="/">{t("nav.login")}</Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="icon"
                            rounded="lg"
                            animate={false}
                            onClick={() => setOpen((prev) => !prev)}
                            aria-label="Menu"
                        >
                            ☰
                        </Button>
                    )}
                </div>
            </div>

            {isMobile && open ? (
                <div className="border-t border-border px-4 py-4">
                    <nav className="flex flex-col gap-3">
                        {links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.to}
                                onClick={() => setOpen(false)}
                                className="text-sm font-medium text-ink-secondary"
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        <Button to="/" className="mt-1 w-full">
                            {t("nav.login")}
                        </Button>
                    </nav>
                </div>
            ) : null}

            <Modal open={prefOpen} onClose={() => setPrefOpen(false)} title={t("pref.title")}>
                <DynamicPrefText />
                <DynamicPrefNumber />
            </Modal>
        </header>
    );
}
