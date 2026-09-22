import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Typography from "./Text";

const ToastContext = createContext(null);

const tones = {
  success: {
    bar: "bg-success",
    icon: "text-success",
    ring: "ring-success/20",
  },
  error: {
    bar: "bg-error",
    icon: "text-error",
    ring: "ring-error/20",
  },
  warning: {
    bar: "bg-warning",
    icon: "text-warning",
    ring: "ring-warning/20",
  },
  info: {
    bar: "bg-info",
    icon: "text-info",
    ring: "ring-info/20",
  },
};

function ToastIcon({ type }) {
  if (type === "success") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4m0 4h.01M10.3 4.2L2.6 18a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 4.2a2 2 0 00-3.4 0z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v4h1" />
    </svg>
  );
}

function ToastItem({ toast, onClose }) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(100);
  const started = useRef(0);
  const tone = tones[toast.type] || tones.info;

  useEffect(() => {
    const show = requestAnimationFrame(() => setOpen(true));
    started.current = performance.now();
    let frame;

    const tick = (now) => {
      const elapsed = now - started.current;
      const next = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(next);
      if (next > 0) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    const hide = setTimeout(() => setOpen(false), toast.duration);
    const remove = setTimeout(onClose, toast.duration + 280);

    return () => {
      cancelAnimationFrame(show);
      cancelAnimationFrame(frame);
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [onClose, toast.duration]);

  return (
    <div
      className={`pointer-events-auto w-[min(100%,22rem)] overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-xl shadow-ink/10 ring-1 backdrop-blur-xl ${tone.ring}`}
      style={{
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
        transition: "opacity 280ms ease, transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      role="status"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className={`mt-0.5 ${tone.icon}`}>
          <ToastIcon type={toast.type} />
        </span>
        <div className="min-w-0 flex-1">
          {toast.title ? (
            <Typography variant="h5" className="mb-0.5">
              {toast.title}
            </Typography>
          ) : null}
          <Typography variant="bodySm">{toast.message}</Typography>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTimeout(onClose, 220);
          }}
          className="rounded-lg p-1 text-muted-soft transition hover:bg-surface-soft hover:text-ink"
          aria-label="Dismiss"
        >
          x
        </button>
      </div>
      <div className="h-1 bg-surface-soft">
        <div className={`h-full ${tone.bar}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [
      ...prev.slice(-3),
      {
        id,
        message,
        title: options.title,
        type: options.type || "info",
        duration: options.duration || 3600,
      },
    ]);
    return id;
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => remove(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
