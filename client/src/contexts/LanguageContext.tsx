import React, { createContext, useContext, useState, useEffect, useRef } from "react";

type Language = "TR" | "EN" | "AR";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("TR");
  const [transitioning, setTransitioning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pathLang = window.location.pathname.split("/")[1];
    if (pathLang === "en") setLangState("EN");
    else if (pathLang === "ar") setLangState("AR");
    else setLangState("TR");

    document.documentElement.dir = pathLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = pathLang === "ar" ? "ar" : pathLang === "en" ? "en" : "tr";
  }, []);

  const setLang = (newLang: Language) => {
    setTransitioning(true);
    setTimeout(() => {
      setLangState(newLang);
      document.documentElement.dir = newLang === "AR" ? "rtl" : "ltr";
      document.documentElement.lang = newLang === "AR" ? "ar" : newLang === "EN" ? "en" : "tr";
      setTimeout(() => {
        setTransitioning(false);
      }, 400);
    }, 350);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL: lang === "AR" }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "#F7F3EC",
          pointerEvents: transitioning ? "all" : "none",
          opacity: transitioning ? 1 : 0,
          transition: transitioning
            ? "opacity 350ms cubic-bezier(0.4,0,0.2,1)"
            : "opacity 400ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
