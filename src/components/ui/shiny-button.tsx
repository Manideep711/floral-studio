"use client";
// Adapted from Magic UI Shiny Button (MIT), luis-code.
import {forwardRef,type ReactNode} from "react";
import {motion,useReducedMotion,type HTMLMotionProps} from "motion/react";
export const ShinyButton=forwardRef<HTMLButtonElement,Omit<HTMLMotionProps<"button">,"children">&{children?:ReactNode}>(function ShinyButton({children,className="",disabled,type="button",...props},ref){
 const reduced=useReducedMotion();
 return <motion.button ref={ref} type={type} disabled={disabled} className={`shiny-button ${className}`} initial={{"--x":"100%"}} animate={{"--x":reduced||disabled ? "100%" : "-100%"}} whileTap={reduced||disabled ? undefined : {scale:.97}} transition={{"--x":{duration:2.2,repeat:reduced||disabled ? 0 : Infinity,repeatDelay:1.5,ease:"easeInOut"}}} {...props}><span className="shiny-button-label">{children}</span><span aria-hidden="true" className="shiny-button-glare"/><span aria-hidden="true" className="shiny-button-border"/></motion.button>;
});
