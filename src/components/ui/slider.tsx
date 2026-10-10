"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
// Adapted from shadcn/ui's MIT-licensed Radix slider. See docs/component-sources.md.
import * as Primitive from "@radix-ui/react-slider";
import type {ComponentProps} from "react";
import LogoMark from "./LogoMark";
export function Slider({className="",label,valueText,value,defaultValue,min=0,max=100,...props}:ComponentProps<typeof Primitive.Root>&{label:string;valueText?:string}) {
  const {tr,locale}=useLanguage();
  const values=value??defaultValue??[min];
  return <Primitive.Root data-slot="slider" className={`ui-slider ${className}`} value={value} defaultValue={defaultValue} min={min} max={max} {...props}><Primitive.Track data-slot="slider-track" className="ui-slider-track"><Primitive.Range data-slot="slider-range" className="ui-slider-range"/></Primitive.Track>{values.map((_,index)=><Primitive.Thumb data-slot="slider-thumb" className="ui-slider-thumb" key={index} aria-label={tr(label)} aria-valuetext={valueText}><span className="slider-knob" aria-hidden="true"><LogoMark size={22}/></span></Primitive.Thumb>)}</Primitive.Root>;
}
