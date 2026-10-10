"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
export default function LanguageToggle(){
 const {locale,setLocale}=useLanguage();
 return <button type="button" className="language-toggle" lang={locale==="en" ? "te" : "en"} aria-label={locale==="en" ? "తెలుగులోకి మార్చండి" : "Switch to English"} onClick={()=>setLocale(locale==="en" ? "te" : "en")}>{locale==="en" ? "తెలుగు" : "EN"}</button>;
}
