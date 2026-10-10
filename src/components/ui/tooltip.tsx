"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
// Adapted from shadcn/ui's MIT-licensed Radix tooltip.
import * as Primitive from "@radix-ui/react-tooltip";
import type {ComponentProps,ReactElement} from "react";
export function TooltipProvider(props:ComponentProps<typeof Primitive.Provider>){return <Primitive.Provider delayDuration={250} {...props}/>;}
export function Tooltip({children,text}:{children:ReactElement;text:string}){
  const {tr,locale}=useLanguage();return <Primitive.Root><Primitive.Trigger asChild>{children}</Primitive.Trigger><Primitive.Portal><Primitive.Content className="ui-tooltip" sideOffset={8} collisionPadding={12}>{text}<Primitive.Arrow className="ui-tooltip-arrow"/></Primitive.Content></Primitive.Portal></Primitive.Root>;}
