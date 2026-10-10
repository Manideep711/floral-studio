"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
export default function SkipLink(){const {tr}=useLanguage();return <a className="skip-link" href="#main-content">{tr("Skip to main content")}</a>;}
