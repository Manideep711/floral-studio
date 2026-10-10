"use client";
import {useState} from "react";
import Link from "next/link";
import type {Design} from "@/lib/design/schema";
import {PENDING_KEY,publicSnapshot} from "@/lib/garden/model";
export default function GardenInvite({design}:{design:Design}){
  const [error,setError]=useState("");
  function prepare(){try{localStorage.setItem(PENDING_KEY,JSON.stringify({savedAt:Date.now(),design:publicSnapshot(design,design.personalization.title)}));window.location.assign("/garden?publish=1");}catch{setError("Allow browser storage to carry this design to the garden. You can still keep arranging.");}}
  return <section className="garden-invite"><div><p className="eyebrow">A LITTLE JOY, SHARED</p><h2>Let your flowers join the garden.</h2><p>A shared canvas of everyone’s Bathukamma. Sign in, then choose whether to publish yours.</p></div><div><button className="primary-button" onClick={prepare}>Add mine to the garden ↗</button><Link className="text-button" href="/garden">Just explore the garden →</Link></div>{error&&<p role="alert">{error}</p>}</section>;
}
