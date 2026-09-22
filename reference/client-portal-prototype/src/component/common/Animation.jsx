import { useEffect, useRef, useState } from "react";

const presets = {
    fade: {
        from: { opacity: 0, transform: "none" },
        to: { opacity: 1, transform: "none" },
    },
    fadeUp: {
        from: { opacity: 0, transform: "translateY(28px)" },
        to: { opacity: 1, transform: "translateY(0)" },
    },
    fadeDown: {
        from: { opacity: 0, transform: "translateY(-28px)" },
        to: { opacity: 1, transform: "translateY(0)" },
    },
    fadeLeft: {
        from: { opacity: 0, transform: "translateX(32px)" },
        to: { opacity: 1, transform: "translateX(0)" },
    },
    fadeRight: {
        from: { opacity: 0, transform: "translateX(-32px)" },
        to: { opacity: 1, transform: "translateX(0)" },
    },
    scale: {
        from: { opacity: 0, transform: "scale(0.94)" },
        to: { opacity: 1, transform: "scale(1)" },
    },
    pop: {
        from: { opacity: 0, transform: "scale(0.8) translateY(12px)" },
        to: { opacity: 1, transform: "scale(1) translateY(0)" },
    },
};

export default function Animation({
    as: Tag = "div",
    type = "fadeUp",
    delay = 0,
    duration = 650,
    once = true,
    className,
    children,
    ...props
}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const preset = presets[type] || presets.fadeUp;

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    if (once) observer.disconnect();
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold: 0.16, rootMargin: "0px 0px -40px 0px" },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [once]);

    return (
        <Tag
            ref={ref}
            className={`will-change-transform${className ? ` ${className}` : ""}`}
            style={{
                ...(visible ? preset.to : preset.from),
                transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
            }}
            {...props}
        >
            {children}
        </Tag>
    );
}

export { presets as animationPresets };
