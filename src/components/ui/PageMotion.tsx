"use client";
import {usePathname} from "next/navigation";
import {MotionConfig,motion,useReducedMotion} from "motion/react";
import BrandLoader from "./BrandLoader";
export default function PageMotion({children}:{children:React.ReactNode}) {
 const pathname=usePathname(),reduced=useReducedMotion();
 // Opacity only: a page-level transform would change fixed/sticky 3D positioning.
 return <MotionConfig reducedMotion="user"><BrandLoader/><motion.div key={pathname} className="page-motion" initial={reduced ? false : {opacity:0}} animate={{opacity:1}} transition={{duration:.3,ease:"easeOut"}}>{children}</motion.div></MotionConfig>;
}
