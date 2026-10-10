"use client";
import {Canvas,useThree} from "@react-three/fiber";
import {canInspect,detailCandidates} from "@/lib/garden/inspection";
import {memo,useEffect,useMemo,useRef,useState} from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {makeFlowerGeometry,makeGardenFlowerGeometry} from "@/lib/three/flowers";
import {flowerAppearance} from "@/lib/flowers/appearance";
import {festivalPosition,nearbyEntries,stableNearbyEntries,festivalHeads,type FestivalHead} from "@/lib/garden/festival";
import type {GardenEntry} from "@/lib/garden/model";
import {flowers,type FlowerId} from "@/lib/flowers/catalog";
import {irregularPosition,worldHex,type HexCell} from "@/lib/garden/spatial";
import {placementCount} from "@/lib/design/layout";
import GardenWorldLabel from "./GardenWorldLabel";
export type FestivalCommand={id:number;type:"angle"|"home"|"in"|"out"|"forward"|"back"|"panLeft"|"panRight"|"jump";slot?:number};
type Props={entries:GardenEntry[];anchor:number;command:FestivalCommand;onReady:()=>void;onFailure:()=>void;onNeighborhood?:(cell:HexCell)=>void;light:boolean;rotate:boolean;mineSlots:readonly number[]};
const noRaycast=()=>{};
export default function FestivalScene(props:Props){return <Canvas dpr={props.light ? 1 : [1,1.3]} frameloop="demand" camera={{position:[19,15,23],fov:43,near:.1,far:3000}} gl={{antialias:true,powerPreference:"low-power"}} fallback={<span>3D is unavailable.</span>}><World {...props}/></Canvas>;}
function World({entries,anchor,command,onReady,onFailure,onNeighborhood,light,rotate,mineSlots}:Props){
  const [inspected,setInspected]=useState<GardenEntry[]>([]);
  const {camera,gl,invalidate,size}=useThree(),orbit=useRef<OrbitControls|null>(null);
  const retainedTarget=useRef(new THREE.Vector3(0,.5,0));
  const appliedCommand=useRef("");
  const headCounts=useMemo(()=>new Map(entries.map(e=>[e.id,placementCount(e.design)])),[entries]);
  const [decorCenter,setDecorCenter]=useState({x:0,z:0});
  const [visible,setVisible]=useState< GardenEntry[]>(()=>nearbyEntries(entries,anchor,0,0).map(p=>p.entry));
  const [detailed,setDetailed]=useState<string[]>([]);
  const signature=useRef("");
  const refresh=useRef(()=>{}),settleTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const heads=useMemo(()=>festivalHeads(visible,anchor),[visible,anchor]);
  const batches=useMemo(()=>flowers.flatMap(f=>[true,false].map(detail=>({kind:f.id,detail,items:heads.filter(p=>p.flower===f.id&&detailed.includes(p.entryId)===detail)}))),[heads,detailed]);
  refresh.current=()=>{
    const controls=orbit.current;if(!controls)return;
    gl.domElement.dataset.gardenReconciles=String(Number(gl.domElement.dataset.gardenReconciles||0)+1);
    camera.updateMatrixWorld();
    const inView=new Set(entries.filter(entry=>{const p=festivalPosition(entry.slot,anchor),projected=new THREE.Vector3(p.x,.8,p.z).project(camera);return Math.abs(projected.x)<1.5&&Math.abs(projected.y)<1.5&&projected.z>-1&&projected.z<1;}).map(entry=>entry.id));
    const nearby=stableNearbyEntries(entries,anchor,controls.target.x,controls.target.z,visible.map(e=>e.id),inView,light?12:24);
    gl.domElement.dataset.gardenSlots=JSON.stringify(nearby.map(p=>({slot:p.entry.slot,x:p.x,z:p.z})));
    const candidates=nearby.map(p=>{const center=new THREE.Vector3(p.x,.8,p.z),screen=center.clone().project(camera);return {id:p.entry.id,distance:camera.position.distanceTo(center),onScreen:Math.abs(screen.x)<1.15&&Math.abs(screen.y)<1.15&&screen.z>-1&&screen.z<1,count:headCounts.get(p.entry.id)||0};});
    const near=detailCandidates(candidates,light,detailed).sort();
    const key=nearby.map(p=>p.entry.id).join(",")+"|"+near.join(",");
    if(key!==signature.current){signature.current=key;setVisible(old=>old.length===nearby.length&&old.every((entry,i)=>entry===nearby[i].entry) ? old : nearby.map(p=>p.entry));setDetailed(old=>old.join(",")===near.join(",") ? old : near);}
    const close=nearby.filter(p=>{const candidate=candidates.find(c=>c.id===p.entry.id)!;return canInspect(candidate.distance,near.includes(p.entry.id),candidate.onScreen);}).map(p=>p.entry);
    setInspected(old=>old.map(e=>e.id).join(",")===close.map(e=>e.id).join(",") ? old : close);
    const x=Math.round(controls.target.x/12)*12,z=Math.round(controls.target.z/12)*12;setDecorCenter(old=>old.x===x&&old.z===z ? old : {x,z});
    const origin=irregularPosition(anchor);onNeighborhood?.(worldHex(controls.target.x+origin.x,controls.target.z+origin.z));invalidate();
  };
  useEffect(()=>{
    gl.domElement.dataset.gardenControls=String(Number(gl.domElement.dataset.gardenControls||0)+1);
    const controls=new OrbitControls(camera,gl.domElement);orbit.current=controls;
    controls.enableDamping=false;controls.enableRotate=false;controls.minDistance=5;controls.maxDistance=100;controls.minPolarAngle=.2;controls.maxPolarAngle=Math.PI*.46;controls.screenSpacePanning=false;controls.target.copy(retainedTarget.current);
    controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
    controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_PAN};
    // Moving the camera only renders existing buffers. Reconcile LOD and the
    // neighborhood once the gesture pauses, rather than on every wheel event.
    const changed=()=>{invalidate();if(settleTimer.current)clearTimeout(settleTimer.current);settleTimer.current=setTimeout(()=>{settleTimer.current=null;refresh.current();},160);};
    controls.update();controls.addEventListener("change",changed);refresh.current();onReady();
    const lost=(e:Event)=>{e.preventDefault();onFailure();};gl.domElement.addEventListener("webglcontextlost",lost);
    return ()=>{if(settleTimer.current)clearTimeout(settleTimer.current);retainedTarget.current.copy(controls.target);controls.removeEventListener("change",changed);controls.dispose();orbit.current=null;gl.domElement.removeEventListener("webglcontextlost",lost);};
  },[camera,gl,invalidate,onReady,onFailure]);
  useEffect(()=>{refresh.current();},[entries,anchor,light]);
  useEffect(()=>{const c=orbit.current;if(!c)return;c.enableRotate=rotate;c.mouseButtons.LEFT=rotate ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;c.touches.ONE=rotate ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN;},[rotate]);
  useEffect(()=>{const c=orbit.current;if(!c)return;const key=`${anchor}:${command.id}`;if(appliedCommand.current===key)return;appliedCommand.current=key;const delta=camera.position.clone().sub(c.target);const type=command.type;
    if(type==="home"){const factor=Math.max(1,.95/(size.width/size.height));camera.position.set(19*factor,.5+14.5*factor,23*factor);c.target.set(0,.5,0);}
    else if(type==="angle")camera.position.copy(c.target).add(new THREE.Vector3(19,14.5,23).normalize().multiplyScalar(delta.length()));
    else if(type==="jump"&&command.slot){const p=festivalPosition(command.slot,anchor);c.target.set(p.x,.7,p.z);camera.position.copy(c.target).add(new THREE.Vector3(19,14.5,23).normalize().multiplyScalar(9));}
    else if(type==="in"||type==="out"){delta.setLength(THREE.MathUtils.clamp(delta.length()*(type==="in" ? .8 : 1.25),5,100));camera.position.copy(c.target).add(delta);}
    else {const forward=c.target.clone().sub(camera.position);forward.y=0;forward.normalize();const right=forward.clone().cross(new THREE.Vector3(0,1,0));const move=(type==="forward"||type==="back" ? forward : right).multiplyScalar(type==="forward"||type==="panRight" ? 3 : -3);camera.position.add(move);c.target.add(move);}
    c.update();invalidate();
  },[command,anchor,camera,invalidate,size.width,size.height]);
  return <>
    <color attach="background" args={["#e8eeeb"]}/><fog attach="fog" args={["#e8eeeb",48,125]}/>
    <ambientLight intensity={1.1}/><hemisphereLight args={["#ffffff","#718478",1.5]}/><directionalLight position={[-12,24,12]} intensity={2.2} color="#fff6e8"/><directionalLight position={[12,8,-15]} intensity={.7} color="#ffffff"/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[decorCenter.x,-.09,decorCenter.z]} raycast={noRaycast}><planeGeometry args={[2000,2000]}/><meshStandardMaterial color="#e8eeeb" roughness={1}/></mesh>
    {batches.map(batch=><Heads key={`${batch.kind}-${batch.detail}`} {...batch}/>)}
    {visible.map(entry=>{const p=festivalPosition(entry.slot,anchor);return <group key={entry.id} position={[p.x,0,p.z]}>
      {mineSlots.includes(entry.slot)&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,-.055,0]} raycast={noRaycast}><ringGeometry args={[1.99,2.07,48]}/><meshBasicMaterial color="#287b68" transparent opacity={.65} depthWrite={false}/></mesh>}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.065,0]} raycast={noRaycast}><circleGeometry args={[2.02,32]}/><meshBasicMaterial color="#64766a" transparent opacity={.12} depthWrite={false}/></mesh>
      <mesh position={[0,-.01,0]} raycast={noRaycast}><cylinderGeometry args={[1.88,1.83,.075,40]}/><meshStandardMaterial color="#b99348" metalness={.45} roughness={.5}/></mesh>
    </group>;})}
    <Supports entries={visible} anchor={anchor}/>
    <GardenWorldLabel entries={inspected} anchor={anchor}/>
  </>;
}
const Supports=memo(function Supports({entries,anchor}:{entries:GardenEntry[];anchor:number}){
  const geometry=useMemo(()=>{const pieces:THREE.BufferGeometry[]=[];for(const entry of entries){const p=festivalPosition(entry.slot,anchor);let y=0;entry.design.layers.forEach((l,i)=>{const h=l.rise*.01*(i===entry.design.layers.length-1 ? .65 : 1);const g=new THREE.CylinderGeometry(Math.max(.008,(l.radius-l.width)*.01-.055),Math.max(.03,l.radius*.01-.055),h,16);g.translate(p.x,y+h*.5-.06,p.z);pieces.push(g);y+=l.rise*.01;});}if(!pieces.length)return new THREE.BufferGeometry();const merged=mergeGeometries(pieces)!;pieces.forEach(g=>g.dispose());return merged;},[entries,anchor]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} raycast={noRaycast}><meshStandardMaterial color="#334225" roughness={1}/></mesh>;
});
const Heads=memo(function Heads({kind,detail,items}:{kind:FlowerId;detail:boolean;items:FestivalHead[]}){
  const mesh=useRef<THREE.InstancedMesh>(null),{invalidate,gl}=useThree();
  const capacityRef=useRef(256);
  capacityRef.current=Math.max(capacityRef.current,2**Math.ceil(Math.log2(Math.max(256,items.length))));
  const capacity=capacityRef.current;
  const geometry=useMemo(()=>detail ? makeFlowerGeometry(kind,true) : makeGardenFlowerGeometry(kind),[kind,detail]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useEffect(()=>{const m=mesh.current;if(!m)return;gl.domElement.dataset.gardenUploads=String(Number(gl.domElement.dataset.gardenUploads||0)+1);m.count=items.length;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);const t=new THREE.Object3D();items.forEach((p,i)=>{t.position.set(p.worldX,.045+p.y*.01,p.worldZ);t.rotation.set(-p.slope,-p.rotation,0,"YXZ");const scale=p.scale*flowerAppearance[p.flower].worldScale;t.scale.setScalar(scale);t.updateMatrix();m.setMatrixAt(i,t.matrix);m.setColorAt(i,new THREE.Color(p.color));});m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;if(m.instanceColor)m.instanceColor.setUsage(THREE.DynamicDrawUsage);if(items.length)m.computeBoundingSphere();invalidate();},[items,invalidate,capacity]);
  return <instancedMesh key={capacity} ref={mesh} args={[geometry,undefined,capacity]} raycast={noRaycast}><meshStandardMaterial vertexColors roughness={.85} side={THREE.DoubleSide}/></instancedMesh>;
});
