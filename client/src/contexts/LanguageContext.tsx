import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "TR" | "EN" | "AR";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("TR");

  useEffect(() => {
    // Get language from URL or localStorage
    const pathLang = window.location.pathname.split("/")[1];
    if (pathLang === "en") setLangState("EN");
    else if (pathLang === "ar") setLangState("AR");
    else setLangState("TR");

    // Apply RTL/LTR to document
    document.documentElement.dir = pathLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = pathLang === "ar" ? "ar" : pathLang === "en" ? "en" : "tr";
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    document.documentElement.dir = newLang === "AR" ? "rtl" : "ltr";
    document.documentElement.lang = newLang === "AR" ? "ar" : newLang === "EN" ? "en" : "tr";
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL: lang === "AR" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
