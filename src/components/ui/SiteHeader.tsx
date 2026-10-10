"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import Icon from "./Icon";
export default function SiteHeader({active,children}:{active?:"studio"|"garden";children?:React.ReactNode}) {
  const {tr,locale}=useLanguage();
  return <header className="site-header"><Link href="/" className="brand" aria-label={tr("Bathukamma home")}><span className="brand-mark"><Icon name="flower" size={26}/></span><span>{tr("Bathukamma")}<span className="brand-small">{tr("Digital flower studio")}</span></span></Link><nav aria-label={tr("Main navigation")}><Link href="/studio" className="nav-link" aria-current={active==="studio" ? "page" : undefined}>{tr("Studio")}</Link><Link href="/garden" className="nav-link" aria-current={active==="garden" ? "page" : undefined}>{tr("Garden")}</Link>{children}<LanguageToggle/></nav></header>;
}
