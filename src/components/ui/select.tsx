"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import * as Primitive from "@radix-ui/react-select";
import {useId,useRef,useState,type ReactNode} from "react";
import Icon from "./Icon";
type Option={value:string;label:string;description?:string;icon?:ReactNode};
export function Select({label,value,onValueChange,options,className="",disabled=false}:{label:string;value:string;onValueChange:(value:string)=>void;options:Option[];className?:string;disabled?:boolean}) {
  const {tr,locale}=useLanguage();
 const id=useId(),trigger=useRef<HTMLButtonElement>(null);
 const [container,setContainer]=useState<HTMLElement|undefined>();
 return <div className={`ui-select-field ${className}`}><label htmlFor={id}>{tr(label)}</label>
  <Primitive.Root value={value} onValueChange={onValueChange} disabled={disabled} onOpenChange={open=>{if(open)setContainer(trigger.current?.closest("dialog")??undefined);}}>
   <Primitive.Trigger ref={trigger} id={id} className="ui-select-trigger" aria-label={tr(label)}><Primitive.Value/><Primitive.Icon className="ui-select-chevron"><Icon name="down" size={16}/></Primitive.Icon></Primitive.Trigger>
   {/* Keep menus inside a native dialog's top layer when used by template filters. */}
   <Primitive.Portal container={container}><Primitive.Content className="ui-select-content" position="popper" sideOffset={6} collisionPadding={12} align="start">
    <Primitive.ScrollUpButton className="ui-select-scroll"><Icon name="up" size={16}/></Primitive.ScrollUpButton>
    <Primitive.Viewport className="ui-select-viewport">{options.map(option=><Primitive.Item key={option.value} value={option.value} textValue={tr(option.label)} className="ui-select-item">
     {option.icon&&<span className="ui-select-option-icon" aria-hidden="true">{option.icon}</span>}<span className="ui-select-option-copy"><Primitive.ItemText>{tr(option.label)}</Primitive.ItemText>{option.description&&<span className="ui-select-description">{tr(option.description)}</span>}</span><Primitive.ItemIndicator className="ui-select-check"><Icon name="check" size={16}/></Primitive.ItemIndicator>
    </Primitive.Item>)}</Primitive.Viewport>
    <Primitive.ScrollDownButton className="ui-select-scroll"><Icon name="down" size={16}/></Primitive.ScrollDownButton>
   </Primitive.Content></Primitive.Portal>
  </Primitive.Root>
 </div>;
}
