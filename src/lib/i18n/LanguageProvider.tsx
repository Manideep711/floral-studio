"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import {translate,type Locale} from "./copy";
// Keep translations and saved preferences for the later Telugu release.
export const TELUGU_ENABLED=false;
const Context=createContext({locale:"en" as Locale,setLocale:(_locale:Locale)=>{},tr:(text:string)=>text});
export function LanguageProvider({children}:{children:ReactNode}){
  const [locale,setLocale]=useState<Locale>("en");
  useEffect(()=>{try{if(TELUGU_ENABLED&&localStorage.getItem("bathukamma:language")==="te")setLocale("te");}catch{}},[]);
  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dataset.language=locale;},[locale]);
  function change(next:Locale){if(next==="te"&&!TELUGU_ENABLED)return;setLocale(next);try{localStorage.setItem("bathukamma:language",next);}catch{}}
  return <Context.Provider value={{locale,setLocale:change,tr:text=>translate(text,locale)}}>{children}</Context.Provider>;
}
export function useLanguage(){return useContext(Context);}
