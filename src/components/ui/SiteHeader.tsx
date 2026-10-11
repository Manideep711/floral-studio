"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import Link from "next/link";
import {useEffect,useId,useRef,useState} from "react";
import {motion,useReducedMotion,useScroll,useMotionValueEvent} from "motion/react";
import LanguageToggle from "./LanguageToggle";
import Icon from "./Icon";
// Aceternity-style floating navigation using the app's existing Motion stack.
export default function SiteHeader({active,children}:{active?:"studio"|"garden";children?:React.ReactNode}) {
 const {tr}=useLanguage(),reduced=useReducedMotion(),{scrollY}=useScroll();
 const [visible,setVisible]=useState(true),[focused,setFocused]=useState(false),[open,setOpen]=useState(false),[hover,setHover]=useState<string|null>(null);
 const shell=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null),menuId=useId();
 const scrollAnchor=useRef(0);
 useMotionValueEvent(scrollY,"change",value=>{if(value<60){setVisible(true);scrollAnchor.current=value;return;}if(Math.abs(value-scrollAnchor.current)<8)return;setVisible(value<scrollAnchor.current);scrollAnchor.current=value;});
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(e.target instanceof Node&&!shell.current?.contains(e.target))setOpen(false);};const escape=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);toggle.current?.focus();}};document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);return ()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};},[open]);
 return <header ref={shell} className="resizable-nav-shell floating-nav-shell" onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}}><motion.div className="site-header resizable-nav" data-compact={true} data-menu-open={open} initial={false} animate={{maxWidth:860,borderRadius:32,y:visible||open||focused ? 0 : -130,opacity:visible||open||focused ? 1 : 0}} style={{pointerEvents:visible||open||focused ? "auto" : "none"}} transition={reduced ? {duration:0} : {type:"spring",stiffness:240,damping:30}}>
 <Link href="/" className="brand" aria-label={tr("Bathukamma home")}><span className="brand-mark"><Icon name="flower" size={26}/></span><span>{tr("Bathukamma")}<span className="brand-small">{tr("Digital flower studio")}</span></span></Link>
 <button ref={toggle} className="navbar-toggle icon-button" type="button" aria-label={tr(open ? "Close navigation" : "Open navigation")} aria-expanded={open} aria-controls={menuId} onClick={()=>setOpen(v=>!v)}><span className="menu-bars" aria-hidden="true"><i/><i/></span></button>
 <nav id={menuId} aria-label={tr("Main navigation")} onMouseLeave={()=>setHover(null)} onClick={()=>setOpen(false)}>{(["studio","garden"] as const).map(item=><Link key={item} href={`/${item}`} className="nav-link" aria-current={active===item ? "page" : undefined} onMouseEnter={()=>setHover(item)} onFocus={()=>setHover(item)} onBlur={()=>setHover(null)}>{(hover===item||(!hover&&active===item))&&<motion.span className="navbar-link-highlight" layoutId={`${menuId}-highlight`} transition={reduced ? {duration:0} : {type:"spring",stiffness:350,damping:30}}/>}<span>{tr(item==="studio" ? "Studio" : "Garden")}</span></Link>)}{children}<LanguageToggle/></nav>
 </motion.div></header>;
}
