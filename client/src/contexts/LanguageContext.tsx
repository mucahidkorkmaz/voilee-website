import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";

type Language = "TR" | "EN" | "AR";

function langFromPathSegment(firstSegment: string | undefined): Language {
  const s = firstSegment?.toLowerCase();
  if (s === "en") return "EN";
  if (s === "ar") return "AR";
  return "TR";
}

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
  syncFromPath: (pathname: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("TR");
  const [transitioning, setTransitioning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const syncFromPath = useCallback((pathname: string) => {
    const seg = pathname.split("/").filter(Boolean)[0];
    const L = langFromPathSegment(seg);
    setLangState(L);
    document.documentElement.dir = L === "AR" ? "rtl" : "ltr";
    document.documentElement.lang = L === "AR" ? "ar" : L === "EN" ? "en" : "tr";
  }, []);

  useEffect(() => {
    syncFromPath(window.location.pathname);
  }, [syncFromPath]);

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
    <LanguageContext.Provider value={{ lang, setLang, isRTL: lang === "AR", syncFromPath }}>
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

/** Keeps `lang` in sync with the URL prefix when using client-side navigation. */
export function LangPathSync() {
  const [loc] = useLocation();
  const { syncFromPath } = useLanguage();
  useEffect(() => {
    syncFromPath(loc);
  }, [loc, syncFromPath]);
  return null;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
