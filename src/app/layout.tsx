import localFont from "next/font/local";
import {TooltipProvider} from "@/components/ui/tooltip";
import PageMotion from "@/components/ui/PageMotion";
import SkipLink from "@/components/ui/SkipLink";
import TypographyController from "@/components/ui/TypographyController";
import {LanguageProvider} from "@/lib/i18n/LanguageProvider";
import type {Metadata} from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./paused-features.css";
import "./home.css";
import "./studio.css";
import "./bloom.css";
import "./premium.css";
import "./typography.css";
import "./language.css";
const editorial = localFont({src:[{path:"../../public/fonts/fraunces.woff2",style:"normal"},{path:"../../public/fonts/fraunces-italic.woff2",style:"italic"}],variable:"--font-editorial",weight:"100 900",display:"swap"});
const interfaceFont = localFont({src:"../../public/fonts/manrope.woff2",variable:"--font-interface",weight:"200 800",display:"swap"});
export const metadata:Metadata={icons:{icon:[{url:"/brand/logo.svg",type:"image/svg+xml"},{url:"/brand/icon-32.png",sizes:"32x32",type:"image/png"}],apple:"/brand/apple-touch-icon.png"},title:"Bathukamma — Your digital flower studio",description:"Layer by layer, create your own digital Bathukamma. An original botanical flower studio celebrating Telangana."};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return <html lang="en" className={`${editorial.variable} ${interfaceFont.variable}`}><body><LanguageProvider><SkipLink/><TooltipProvider><PageMotion>{children}</PageMotion></TooltipProvider><TypographyController/></LanguageProvider><noscript><style>{".brand-loader{display:none!important}.page-motion,.premium-reveal{opacity:1!important;filter:none!important;transform:none!important}"}</style></noscript></body></html>;
}
