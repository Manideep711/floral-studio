"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {trackEvent} from "@/lib/admin/analytics";
export default function UsageTracker(){const path=usePathname();useEffect(()=>{if(path!=="/admin/")trackEvent("page_view");},[path]);return null;}
