import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const TEXT_SCALE_MIN = 0.75;
export const TEXT_SCALE_MAX = 1;
export const TEXT_SCALE_STEPS = [0.75, 0.83, 0.92, 1];
export const NUMBER_FORMATS = ["indian", "international"];
export const DEFAULT_NUMBER_FORMAT = "indian";

const PrefContext = createContext(null);

function clampScale(value) {
  const next = Number(value);
  if (Number.isNaN(next)) return TEXT_SCALE_MAX;
  return Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, next));
}

function getInitialScale() {
  const saved = Number(localStorage.getItem("fintra-text-scale"));
  return clampScale(Number.isNaN(saved) ? TEXT_SCALE_MAX : saved);
}

function applyScale(scale) {
  document.documentElement.style.setProperty("--type-scale", String(scale));
}

function getInitialNumberFormat() {
  const saved = localStorage.getItem("fintra-number-format");
  return NUMBER_FORMATS.includes(saved) ? saved : DEFAULT_NUMBER_FORMAT;
}

export function PrefProvider({ children }) {
  const [textScale, setTextScaleState] = useState(() => {
    const initial = getInitialScale();
    applyScale(initial);
    return initial;
  });
  const [numberFormat, setNumberFormatState] = useState(getInitialNumberFormat);

  useEffect(() => {
    applyScale(textScale);
    localStorage.setItem("fintra-text-scale", String(textScale));
  }, [textScale]);

  useEffect(() => {
    localStorage.setItem("fintra-number-format", numberFormat);
  }, [numberFormat]);

  const value = useMemo(
    () => ({
      textScale,
      setTextScale: (next) => setTextScaleState(clampScale(next)),
      resetTextScale: () => setTextScaleState(TEXT_SCALE_MAX),
      numberFormat,
      setNumberFormat: (next) =>
        setNumberFormatState(
          NUMBER_FORMATS.includes(next) ? next : DEFAULT_NUMBER_FORMAT,
        ),
      resetNumberFormat: () => setNumberFormatState(DEFAULT_NUMBER_FORMAT),
    }),
    [textScale, numberFormat],
  );

  return <PrefContext.Provider value={value}>{children}</PrefContext.Provider>;
}

export function usePref() {
  const context = useContext(PrefContext);
  if (!context) {
    throw new Error("usePref must be used inside PrefProvider");
  }
  return context;
}
