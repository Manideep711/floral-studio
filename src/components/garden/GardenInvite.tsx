"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import {useState} from "react";
import Link from "next/link";
import type {Design} from "@/lib/design/schema";
import {PENDING_KEY,publicSnapshot} from "@/lib/garden/model";
export default function GardenInvite({design}:{design:Design}){
  const {tr,locale}=useLanguage();
  const [error,setError]=useState("");
  function prepare(){try{localStorage.setItem(PENDING_KEY,JSON.stringify({savedAt:Date.now(),design:publicSnapshot(design,design.personalization.title)}));window.location.assign("/garden?publish=1");}catch{setError("Allow browser storage to carry this design to the garden. You can still keep arranging.");}}
  return <section className="garden-invite"><div><p className="eyebrow">{tr("Garden")}</p><h2>{tr("Add to the garden")}</h2><p>{tr("Sign in to publish. Sharing is your choice.")}</p></div><div><button className="primary-button" onClick={prepare}>{tr("Add mine ↗")}</button><Link className="text-button" href="/garden">{tr("Explore garden →")}</Link></div>{error&&<p role="alert">{tr(error)}</p>}</section>;
}
