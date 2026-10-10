"use client";
import {useEffect,useRef,type RefObject} from "react";
import Lenis from "lenis";

/** Keep native scrolling within the current chapter until its flowers are placed. */
export function useStoryGate(root:RefObject<HTMLDivElement|null>,step:number,reduced:boolean|null){
  const smooth=useRef<Lenis|null>(null),maximum=useRef<()=>number>(()=>Infinity);
  useEffect(()=>{
    const lenis=new Lenis({
      autoRaf:true,lerp:.12,smoothWheel:true,syncTouch:false,anchors:true,
      respectReducedMotion:true,stopInertiaOnNavigate:true,
      virtualScroll:data=>{
        if(data.deltaY<=0||data.event.ctrlKey)return true;
        const remaining=Math.max(0,maximum.current()-lenis.targetScroll);
        if(remaining===0){if(data.event.cancelable)data.event.preventDefault();return false;}
        data.deltaY=Math.min(data.deltaY,remaining);
        return true;
      }
    });
    smooth.current=lenis;
    return ()=>{smooth.current=null;lenis.destroy();};
  },[]);
  useEffect(()=>{
    const element=root.current;if(!element)return;
    const current=element.querySelector<HTMLElement>(step<4 ? `#story-layer-${step+1}` : "#story-finish");
    if(!current)return;
    const limit=()=>{
      const margin=parseFloat(getComputedStyle(current).scrollMarginTop)||32;
      const top=current.getBoundingClientRect().top+window.scrollY-margin;
      const button=current.querySelector("button");
      const buttonBottom=button ? button.getBoundingClientRect().bottom+window.scrollY-window.innerHeight+24 : top;
      return Math.max(0,top,buttonBottom);
    };
    maximum.current=step<4 ? limit : ()=>Infinity;
    const constrain=()=>{
      if(step<4&&window.scrollY>limit()+1){
        if(smooth.current)smooth.current.scrollTo(limit(),{immediate:true});
        else window.scrollTo({top:limit(),behavior:"instant"});
      }
    };
    let touchY=0;
    const touchStart=(event:TouchEvent)=>{touchY=event.touches[0]?.clientY??0;};
    const touchMove=(event:TouchEvent)=>{
      const y=event.touches[0]?.clientY??touchY,down=touchY-y;touchY=y;
      if(step<4&&down>0&&window.scrollY>=limit()-1)event.preventDefault();
    };
    const key=(event:KeyboardEvent)=>{
      if(step===4||event.altKey||event.ctrlKey||event.metaKey)return;
      const target=event.target as HTMLElement;
      if(target.closest("button,a,input,textarea,select"))return;
      if(["End","PageDown","ArrowDown"," "].includes(event.key)&&window.scrollY>=limit()-1)event.preventDefault();
    };
    if(step<4){
      window.addEventListener("scroll",constrain,{passive:true});
      window.addEventListener("touchstart",touchStart,{passive:true});
      window.addEventListener("touchmove",touchMove,{passive:false});
      window.addEventListener("keydown",key);
      window.addEventListener("resize",constrain);constrain();
    }
    if(step>0){
      current.focus({preventScroll:true});
      if(smooth.current)smooth.current.scrollTo(limit(),{
        immediate:!!reduced,duration:1.2,lerp:0,
        easing:t=>t*t*t*(t*(t*6-15)+10)
      });
      else current.scrollIntoView({behavior:reduced ? "instant" : "smooth",block:"start"});
    }
    return ()=>{
      maximum.current=()=>Infinity;
      window.removeEventListener("scroll",constrain);
      window.removeEventListener("touchstart",touchStart);window.removeEventListener("touchmove",touchMove);
      window.removeEventListener("keydown",key);window.removeEventListener("resize",constrain);
    };
  },[root,step,reduced]);
}
