"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import LogoMark from "./LogoMark";
export default function SiteFooter(){
  const {tr,locale}=useLanguage();return <footer className="site-footer"><span>{tr("Made for Bathukamma.")}</span><span className="footer-brand"><LogoMark size={20}/><span lang="te">బతుకమ్మ</span></span></footer>;}
