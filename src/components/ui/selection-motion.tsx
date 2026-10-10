"use client";
import {useId,type ComponentProps} from "react";
import {LayoutGroup,motion,useReducedMotion} from "motion/react";

// Each group owns its highlight, so open dialogs and editor tabs never share one.
export function SelectionGroup({children,className="",...props}:ComponentProps<typeof motion.div>) {
 const id=useId();
 return <LayoutGroup id={id}><motion.div layoutScroll className={`motion-selection-group ${className}`} {...props}>{children}</motion.div></LayoutGroup>;
}
export function SelectionHighlight({className=""}:{className?:string}) {
 const reduced=useReducedMotion();
 return <motion.span aria-hidden="true" className={`selection-highlight ${className}`} layoutId={reduced ? undefined : "selection"} initial={false} transition={reduced ? {duration:0} : {type:"spring",stiffness:420,damping:36,mass:.8}} style={{borderRadius:7}}/>;
}
