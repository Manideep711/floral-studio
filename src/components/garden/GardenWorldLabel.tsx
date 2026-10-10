"use client";
import {useEffect,useMemo} from "react";
import {createRoot} from "react-dom/client";
import {useFrame,useThree} from "@react-three/fiber";
import {CSS2DObject,CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {Vector3} from "three";
import {festivalPosition} from "@/lib/garden/festival";
import type {GardenEntry} from "@/lib/garden/model";

// One on-demand renderer serves the bounded set of close-range nicknames.
export default function GardenWorldLabel({entries,anchor}:{entries:GardenEntry[];anchor:number}){
 const {scene,camera,gl,size,invalidate}=useThree();
 const renderer=useMemo(()=>new CSS2DRenderer(),[]);
 const labels=useMemo(()=>entries.map(entry=>{const element=document.createElement("div");element.className="garden-world-label";return {entry,label:new CSS2DObject(element)};}),[entries]);
 const right=useMemo(()=>new Vector3(),[]),screen=useMemo(()=>new Vector3(),[]);
 useEffect(()=>{
  const surface=renderer.domElement;surface.className="garden-world-label-layer";
  Object.assign(surface.style,{position:"absolute",inset:"0",pointerEvents:"none",overflow:"hidden"});
  gl.domElement.parentElement?.appendChild(surface);invalidate();
  return ()=>{surface.remove();};
 },[renderer,gl,invalidate]);
 useEffect(()=>{renderer.setSize(size.width,size.height);invalidate();},[renderer,size.width,size.height,invalidate]);
 useEffect(()=>{
  const roots=labels.map(({entry,label})=>{const root=createRoot(label.element);root.render(<div className="garden-glass-label"><strong>{entry.creator_name}</strong></div>);scene.add(label);return root;});
  invalidate();
  return ()=>{labels.forEach(({label},i)=>{scene.remove(label);roots[i].unmount();});};
 },[labels,scene,invalidate]);
 useFrame(()=>{
  right.setFromMatrixColumn(camera.matrixWorld,0);right.y=0;right.normalize();
  for(const {entry,label} of labels){
   const p=festivalPosition(entry.slot,anchor),height=entry.design.layers.reduce((sum,l)=>sum+l.rise,0)*.01;
   label.center.set(0,.5);
   label.position.set(p.x,height*.7+.2,p.z).addScaledVector(right,2.15);
   screen.copy(label.position).project(camera);
   const width=label.element.offsetWidth||120;
   const maxX=1-2*(width+12)/size.width;
   if(screen.x>maxX){screen.x=maxX;label.position.copy(screen.unproject(camera));}
  }
  renderer.render(scene,camera);
 });
 return null;
}
