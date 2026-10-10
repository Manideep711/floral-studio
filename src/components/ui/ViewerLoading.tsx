"use client";
import {motion,useReducedMotion} from "motion/react";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import LogoSequence from "./LogoSequence";
export default function ViewerLoading(){const {tr}=useLanguage();const reduced=useReducedMotion();return <motion.div className="brand-loader viewer-splash" role="status" aria-label={tr("Opening Bathukamma")} initial={false} exit={reduced ? {opacity:0} : {y:"-100%"}} transition={{duration:reduced ? .12 : .5,ease:[.76,0,.24,1]}}><div className="brand-loader-mark" aria-hidden="true"><LogoSequence/></div></motion.div>;}
