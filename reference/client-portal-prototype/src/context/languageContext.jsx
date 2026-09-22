import { createContext, useContext, useEffect, useMemo, useState } from "react";
import bn from "../data/bn";
import en from "../data/en";

const dictionaries = { en, bn };
const LanguageContext = createContext(null);

function getNested(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function getInitialLanguage() {
  const saved = localStorage.getItem("fintra-lang");
  return saved === "bn" ? "bn" : "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const initial = getInitialLanguage();
    document.documentElement.lang = initial;
    return initial;
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("fintra-lang", language);
  }, [language]);

  const value = useMemo(() => {
    const dict = dictionaries[language] || en;
    return {
      language,
      setLanguage,
      toggleLanguage: () =>
        setLanguage((prev) => (prev === "en" ? "bn" : "en")),
      t: (path) => getNested(dict, path) ?? path,
      dict,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
