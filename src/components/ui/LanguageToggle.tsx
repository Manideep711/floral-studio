"use client";
import {useLanguage,TELUGU_ENABLED} from "@/lib/i18n/LanguageProvider";
export default function LanguageToggle(){
 const {locale,setLocale}=useLanguage();
 if(!TELUGU_ENABLED)return null;
 return <button type="button" className="language-toggle" lang={locale==="en" ? "te" : "en"} aria-label={locale==="en" ? "తెలుగులోకి మార్చండి" : "Switch to English"} onClick={()=>setLocale(locale==="en" ? "te" : "en")}>{locale==="en" ? "తెలుగు" : "EN"}</button>;
}
