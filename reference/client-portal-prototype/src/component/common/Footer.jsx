import { useLanguage } from "../../context/languageContext";
import { containerClass } from "../../utils/responsive";
import Button from "./Button";
import Typography from "./Text";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-border bg-surface">
            <div
                className={`${containerClass} flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between`}
            >
                <Typography variant="bodySm">
                    © {new Date().getFullYear()} {t("brand")}. {t("footer.rights")}
                </Typography>
                <div className="flex gap-5">
                    <Button variant="link" to="/" underline>
                        {t("footer.privacy")}
                    </Button>
                    <Button variant="link" to="/" underline>
                        {t("footer.terms")}
                    </Button>
                </div>
            </div>
        </footer>
    );
}
