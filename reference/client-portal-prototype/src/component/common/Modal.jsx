import { useEffect } from "react";
import { createPortal } from "react-dom";
import Typography from "./Text";

export default function Modal({
    open,
    onClose,
    title,
    children,
    className = "",
}) {
    useEffect(() => {
        if (!open) return undefined;

        const onKey = (event) => {
            if (event.key === "Escape") onClose?.();
        };

        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <button
                type="button"
                className="absolute inset-0 cursor-pointer bg-ink/50 backdrop-blur-sm"
                aria-label="Close dialog"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "fintra-modal-title" : undefined}
                className={`relative w-full max-w-md max-h-[min(90vh,40rem)] overflow-y-auto rounded-3xl border border-border bg-surface p-5 shadow-2xl shadow-ink/20 sm:p-6 ${className}`}
            >
                <div className="mb-5 flex items-start justify-between gap-4">
                    {title ? (
                        <Typography id="fintra-modal-title" variant="h4">
                            {title}
                        </Typography>
                    ) : (
                        <span />
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-border text-muted transition hover:border-brand hover:text-ink"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body,
    );
}
