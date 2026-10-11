import FlowerPointer from "@/components/ui/pointer";
import {ProgressiveBlur} from "@/components/ui/progressive-blur";
import localFont from "next/font/local";
import {TooltipProvider} from "@/components/ui/tooltip";
import PageMotion from "@/components/ui/PageMotion";
import SkipLink from "@/components/ui/SkipLink";
import {LanguageProvider} from "@/lib/i18n/LanguageProvider";
import type {Metadata} from "next";
import "lenis/dist/lenis.css";
import "./shadcn.css";
import "./globals.css";
import "./paused-features.css";
import "./home.css";
import "./studio.css";
import "./bloom.css";
import "./premium.css";
import "./typography.css";
import "./language.css";

const editorial = localFont({src:[{path:"../../public/fonts/lora-400.ttf",weight:"400",style:"normal"},{path:"../../public/fonts/lora-500.ttf",weight:"500",style:"normal"},{path:"../../public/fonts/lora-600.ttf",weight:"600",style:"normal"},{path:"../../public/fonts/lora-700.ttf",weight:"700",style:"normal"}],variable:"--font-editorial",display:"swap"});
const interfaceFont = localFont({src:[{path:"../../public/fonts/poppins-400.woff2",weight:"400",style:"normal"},{path:"../../public/fonts/poppins-500.woff2",weight:"500",style:"normal"},{path:"../../public/fonts/poppins-600.woff2",weight:"600",style:"normal"},{path:"../../public/fonts/poppins-700.woff2",weight:"700",style:"normal"}],variable:"--font-interface",display:"swap"});
export const metadata:Metadata={icons:{icon:[{url:"/brand/logo.svg",type:"image/svg+xml"},{url:"/brand/icon-32.png",sizes:"32x32",type:"image/png"}],apple:"/brand/apple-touch-icon.png"},title:"Bathukamma — Your digital flower studio",description:"Layer by layer, create your own digital Bathukamma. An original botanical flower studio celebrating Telangana."};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return <html lang="en" className={`${editorial.variable} ${interfaceFont.variable}`}><body><LanguageProvider><SkipLink/><TooltipProvider><PageMotion>{children}</PageMotion></TooltipProvider><ProgressiveBlur className="page-edge-blur"/></LanguageProvider><noscript><style>{".brand-loader{display:none!important}.page-motion,.premium-reveal,.blur-fade{opacity:1!important;filter:none!important;transform:none!important}"}</style></noscript></body></html>;
}
