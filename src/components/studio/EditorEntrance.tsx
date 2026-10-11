"use client";
import {useEffect,useState,type ReactNode} from "react";

// Animate existing panels directly so the mobile sticky preview keeps its layout.
export default function EditorEntrance({children}:{children:ReactNode}){
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  const check=()=>{if(!document.querySelector(".brand-loader")){setReady(true);observer.disconnect();}};
  const observer=new MutationObserver(check);
  observer.observe(document.body,{childList:true,subtree:true});check();
  return ()=>observer.disconnect();
 },[]);
 return <div className="editor-entrance" data-ready={ready}>{children}</div>;
}
