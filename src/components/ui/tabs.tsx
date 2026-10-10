"use client";
// Adapted from shadcn/ui's MIT-licensed Radix tabs. Styled with the existing CSS tokens.
import * as Primitive from "@radix-ui/react-tabs";
import type {ComponentProps} from "react";
export function Tabs({className="",...props}:ComponentProps<typeof Primitive.Root>){return <Primitive.Root data-slot="tabs" className={`ui-tabs ${className}`} {...props}/>;}
export function TabsList({className="",...props}:ComponentProps<typeof Primitive.List>){return <Primitive.List data-slot="tabs-list" className={`ui-tabs-list ${className}`} {...props}/>;}
export function TabsTrigger({className="",...props}:ComponentProps<typeof Primitive.Trigger>){return <Primitive.Trigger data-slot="tabs-trigger" className={`ui-tabs-trigger ${className}`} {...props}/>;}
export function TabsContent({className="",...props}:ComponentProps<typeof Primitive.Content>){return <Primitive.Content data-slot="tabs-content" className={`ui-tabs-content ${className}`} {...props}/>;}
