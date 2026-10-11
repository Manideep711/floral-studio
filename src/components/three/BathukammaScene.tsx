"use client";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {useEffect,useMemo,useRef} from "react";
import * as THREE from "three";
import {RoomEnvironment} from "three/examples/jsm/environments/RoomEnvironment.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {makeFlowerGeometry} from "@/lib/three/flowers";
import {flowerAppearance} from "@/lib/flowers/appearance";
import {generateLayout} from "@/lib/design/layout";
import {revealAt,REVEAL_SECONDS} from "@/lib/three/reveal";
import type {Design} from "@/lib/design/schema";
import {flowers,type FlowerId} from "@/lib/flowers/catalog";
import type {BloomCapture} from "../share/ShareCard";
import type {MotionValue} from "motion/react";
export type SceneCommand={type:"replay"|"skip"|"reset"|"left"|"right"|"in"|"out";id:number};
export type SceneMetrics={flowers:number;drawCalls:number;triangles:number;revealFps:number};
export type StageStyle="studio"|"daylight"|"evening";
import {DEFAULT_STUDIO_SETTINGS,type StudioSettings} from "@/lib/three/staging";
const stages={
 studio:{background:"#FAFBFB",key:"#FFF3E4",fill:"#E8F0FF",rim:"#FFF8EC",ambient:.12,hemisphere:.35,keyPower:1.9,fillPower:.4,rimPower:.75,environment:.14},
 daylight:{background:"#F4F7F5",key:"#FFFDF5",fill:"#E5F1FF",rim:"#FFFFFF",ambient:.2,hemisphere:.55,keyPower:1.6,fillPower:.7,rimPower:.5,environment:.2},
 evening:{background:"#162B29",key:"#FFE0AE",fill:"#A8C9E5",rim:"#FFE9BD",ambient:.1,hemisphere:.25,keyPower:2.2,fillPower:.3,rimPower:1.2,environment:.1},
} as const;
// Hero lighting retains directional highlights even in the lightweight mobile renderer.
const heroLighting={...stages.studio,ambient:.08,hemisphere:.28,keyPower:2.5,fillPower:.55,rimPower:1.15,environment:.2};
type Props={settings?:StudioSettings;stage?:StageStyle;design:Design;reducedMotion:boolean;command:SceneCommand;onPhase:(phase:string)=>void;onReady:()=>void;onFailure:()=>void;onMetrics:(metrics:SceneMetrics)=>void;onCapture?:(capture:BloomCapture|null)=>void;lowQuality:boolean;storyProgress?:MotionValue<number>};
export default function BathukammaScene(props:Props) {
  // Canvas fallback is ordinary canvas child content, mounted even when WebGL
  // works. Only renderer errors/context loss should activate the 2D fallback.
  return <Canvas shadows={props.lowQuality ? false : "percentage"} dpr={props.lowQuality ? 1 : [1,1.5]} frameloop="demand" camera={{position:[0,7,.001],fov:38,near:.1,far:40}} gl={{antialias:true,alpha:true,powerPreference:"low-power",toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:props.storyProgress ? 1 : .92}} fallback={<span>Interactive 3D Bathukamma.</span>}><Scene {...props}/></Canvas>;
}
function Scene({settings=DEFAULT_STUDIO_SETTINGS,stage="studio",design,reducedMotion,command,onPhase,onReady,onFailure,onMetrics,onCapture,lowQuality,storyProgress}:Props) {
  const {camera,gl,invalidate,size,scene}=useThree();
  const lighting=useMemo(()=>{if(storyProgress)return heroLighting;const base=stages[stage];return {...base,keyPower:base.keyPower*settings.key,fillPower:base.fillPower*settings.fill,rimPower:base.rimPower*settings.rim,ambient:base.ambient*settings.ambient,environment:base.environment*settings.environment};},[storyProgress,stage,settings]);
  useEffect(()=>{if(storyProgress)return;gl.toneMappingExposure=settings.exposure;if(camera instanceof THREE.PerspectiveCamera){camera.fov=settings.fov;camera.updateProjectionMatrix();}invalidate();},[settings.exposure,settings.fov,storyProgress,camera,gl,invalidate]);
  // Bake the studio reflections once per renderer, not per flower or frame.
  useEffect(()=>{
    const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(gl);
    const map=generator.fromScene(room,.04),previous=scene.environment,previousIntensity=scene.environmentIntensity;
    scene.environment=map.texture;scene.environmentIntensity=.14;invalidate();room.dispose();generator.dispose();
    return ()=>{scene.environment=previous;scene.environmentIntensity=previousIntensity;map.dispose();};
  },[gl,scene,invalidate]);
  useEffect(()=>{scene.environmentIntensity=lighting.environment;invalidate();},[lighting,scene,invalidate]);
  const placements=useMemo(()=>generateLayout(design),[design]);
  const height=design.layers.reduce((s,l)=>s+l.rise,0)*.01;
  const contact=useMemo(()=>{
    const pixels=new Uint8Array(64*64*4);
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){
      const r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*64+x)*4;
      pixels[i]=18;pixels[i+1]=30;pixels[i+2]=32;pixels[i+3]=Math.round(62*Math.pow(Math.max(0,1-r),1.8));
    }
    const texture=new THREE.DataTexture(pixels,64,64);texture.needsUpdate=true;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;return texture;
  },[]);
  useEffect(()=>()=>contact.dispose(),[contact]);
  useEffect(()=>{
    const capture:BloomCapture=async()=>{
      const w=lowQuality?768:1024,h=Math.round(w*.8),oldSize=gl.getSize(new THREE.Vector2()),ratio=gl.getPixelRatio(),background=scene.background,clear=gl.getClearColor(new THREE.Color()),alpha=gl.getClearAlpha();
      const floor=scene.getObjectByName("studio-floor"),floorVisible=floor?.visible;
      const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const context=canvas.getContext("2d");if(!context)throw new Error("Capture unavailable");
      try{scene.background=null;if(floor)floor.visible=false;gl.setClearColor(0x000000,0);gl.setPixelRatio(1);gl.setSize(w,h,false);
        const photo=(camera as THREE.PerspectiveCamera).clone();photo.aspect=w/h;photo.updateProjectionMatrix();gl.render(scene,photo);context.drawImage(gl.domElement,0,0,w,h);
      }finally{scene.background=background;if(floor)floor.visible=floorVisible!;gl.setClearColor(clear,alpha);gl.setPixelRatio(ratio);gl.setSize(oldSize.x,oldSize.y,false);gl.render(scene,camera);invalidate();}
      return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob ? resolve(blob) : reject(new Error("Capture failed")),"image/png"));
    };
    onCapture?.(capture);return ()=>onCapture?.(null);
  },[gl,scene,camera,invalidate,height,lowQuality,onCapture]);
  const distanceFactor=Math.max(storyProgress ? .82 : 1,(storyProgress ? .94 : 1.15)/(size.width/size.height));
  const flowerMeshes=useRef<(THREE.InstancedMesh|null)[]>([]);
  const support=useRef<THREE.Group>(null);
  const storyGroup=useRef<THREE.Group>(null);
  useEffect(()=>storyProgress?.on("change",()=>invalidate()),[storyProgress,invalidate]);
  const elapsed=useRef(reducedMotion ? REVEAL_SECONDS : 0);
  const active=useRef(true);
  const refreshOnly=useRef(false);
  const phaseRef=useRef("");
  const controls=useRef<OrbitControls|null>(null);
  const metrics=useRef({frames:0,time:0,valid:!reducedMotion});
  const lastCommand=useRef(-1);
  const previousFactor=useRef(distanceFactor);
  const temp=useMemo(()=>new THREE.Object3D(),[]);
  // Reuse flower surfaces across layer changes; only quality changes rebuild them.
  const geometries=useMemo(()=>flowers.map(f=>({kind:f.id,geometry:makeFlowerGeometry(f.id,lowQuality)})),[lowQuality]);
  useEffect(()=>()=>geometries.forEach(g=>g.geometry.dispose()),[geometries]);
  const groups=useMemo(()=>geometries.map(g=>({...g,items:placements.filter(p=>p.flower===g.kind)})),[placements,geometries]);
  const layerIndices=useMemo(()=>new Map(design.layers.map((layer,index)=>[layer.id,index])),[design.layers]);
  useEffect(()=>{
    const lost=(e:Event)=>{e.preventDefault();onFailure();};gl.domElement.addEventListener("webglcontextlost",lost);
    // The story follows page scroll; camera controls would capture wheel and touch gestures.
    if(storyProgress){
      gl.domElement.style.touchAction="pan-y";
      return ()=>{gl.domElement.style.touchAction="";gl.domElement.removeEventListener("webglcontextlost",lost);};
    }
    const orbit=new OrbitControls(camera,gl.domElement);controls.current=orbit;
    orbit.enableDamping=false;orbit.enablePan=false;orbit.minDistance=3.8;orbit.maxDistance=10;orbit.minPolarAngle=.18;orbit.maxPolarAngle=Math.PI*.46;
    const changed=()=>invalidate();orbit.addEventListener("change",changed);
    return ()=>{controls.current=null;orbit.removeEventListener("change",changed);orbit.dispose();gl.domElement.removeEventListener("webglcontextlost",lost);};
  },[camera,gl,invalidate,onFailure,storyProgress]);
  useEffect(()=>{groups.forEach((group,i)=>{const mesh=flowerMeshes.current[i];if(!mesh)return;mesh.count=group.items.length;group.items.forEach((p,j)=>mesh.setColorAt(j,new THREE.Color(p.color).multiplyScalar(.95+(p.scale-.91)*.45)));if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;});if(!active.current){elapsed.current=REVEAL_SECONDS;active.current=true;refreshOnly.current=true;metrics.current.valid=false;}invalidate();},[groups,invalidate]);
  useEffect(()=>{onReady();invalidate();},[onReady,invalidate]);
  useFrame((_,delta)=>{
    if(storyProgress && storyGroup.current){
      storyGroup.current.rotation.y=THREE.MathUtils.clamp(storyProgress.get(),0,1)*Math.PI*10;
      camera.position.set(3.6*distanceFactor,(3.5+height*.5)*distanceFactor,5*distanceFactor);
      controls.current?.target.set(0,height*.32,0);
      camera.lookAt(0,height*.32,0);
    }
    const orbit=controls.current;
    if(command.id!==lastCommand.current){
      lastCommand.current=command.id;
      if(command.type==="replay"){elapsed.current=reducedMotion?REVEAL_SECONDS:0;active.current=true;refreshOnly.current=false;metrics.current={frames:0,time:0,valid:!reducedMotion};}
      if(command.type==="skip"){elapsed.current=REVEAL_SECONDS;active.current=true;refreshOnly.current=false;metrics.current.valid=false;}
      if(command.type==="reset"){camera.up.set(0,1,0);camera.position.set(3.6*distanceFactor,(3.5+height*.5)*distanceFactor,5*distanceFactor);orbit?.target.set(0,height*.32,0);orbit?.update();}
      if(["left","right"].includes(command.type)){const target=orbit?.target||new THREE.Vector3(0,height*.32,0);camera.position.sub(target).applyAxisAngle(new THREE.Vector3(0,1,0),command.type==="left"?.3:-.3).add(target);orbit?.update();}
      if(["in","out"].includes(command.type)){const target=orbit?.target||new THREE.Vector3(0,height*.32,0);const v=camera.position.clone().sub(target);v.setLength(THREE.MathUtils.clamp(v.length()*(command.type==="in"?.85:1.15),3.8,10));camera.position.copy(target).add(v);orbit?.update();}
    }
    if(!active.current) return;
    elapsed.current=Math.min(REVEAL_SECONDS,elapsed.current+delta);
    const t=elapsed.current,state=revealAt(t);
    if(phaseRef.current!==state.phase){phaseRef.current=state.phase;onPhase(state.phase);}
    groups.forEach((group,i)=>{
      const mesh=flowerMeshes.current[i];if(!mesh)return;
      group.items.forEach((p,j)=>{
        const index=layerIndices.get(p.layerId)!,depth=revealAt(t,index,design.layers.length).depth;
        temp.position.set(p.x*.01,.045+p.y*.01*depth+state.settle*depth,p.z*.01);
        const layer=design.layers[index],slope=p.accent ? .95 : design.layoutVersion===2 ? Math.atan(layer.rise/layer.width) : 0;
        const scale=p.scale*flowerAppearance[p.flower].worldScale;
        temp.rotation.set(-slope*depth,-p.rotation,0,"YXZ");temp.scale.set(scale,.025+(scale-.025)*depth,scale);temp.updateMatrix();mesh.setMatrixAt(j,temp.matrix);
      });mesh.instanceMatrix.needsUpdate=true;if(!storyProgress&&t>=REVEAL_SECONDS)mesh.computeBoundingSphere();
    });
    if(support.current){support.current.scale.y=Math.max(.001,state.depth);support.current.visible=state.depth>.05;}
    if(!refreshOnly.current && !storyProgress){camera.up.set(0,state.camera,-(1-state.camera)).normalize();
    const target=new THREE.Vector3(0,height*.32*state.camera,0);
    camera.position.set(3.6*state.camera*distanceFactor,THREE.MathUtils.lerp(7,(3.5+height*.5)*distanceFactor,state.camera),5*state.camera*distanceFactor+.001);
    camera.lookAt(target);if(orbit){orbit.target.copy(target);orbit.enabled=t>=REVEAL_SECONDS;}}
    metrics.current.frames++;metrics.current.time+=delta;
    if(t>=REVEAL_SECONDS){active.current=false;refreshOnly.current=false;orbit?.update();onMetrics({flowers:placements.length,drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,revealFps:metrics.current.valid ? Math.round(metrics.current.frames/Math.max(.01,metrics.current.time)) : 0});}
    invalidate();
  });
  useEffect(()=>{invalidate();},[command,invalidate]);
  useEffect(()=>{
    if(!active.current && controls.current){const target=controls.current.target;camera.position.sub(target).multiplyScalar(distanceFactor/previousFactor.current).add(target);controls.current.maxDistance=10*distanceFactor;controls.current.update();}
    previousFactor.current=distanceFactor;invalidate();
  },[distanceFactor,camera,invalidate]);
  return <>
    {!storyProgress&&<><color attach="background" args={[lighting.background]}/><fog attach="fog" args={[lighting.background,12,25]}/></>}
    <ambientLight intensity={lighting.ambient}/><hemisphereLight args={["#F2F6FF","#59654D",lighting.hemisphere]}/>
    <directionalLight position={[-3.8,5.5,4.5]} intensity={lighting.keyPower} color={lighting.key} castShadow={!lowQuality} shadow-mapSize={[1024,1024]} shadow-radius={4} shadow-camera-left={-2.5} shadow-camera-right={2.5} shadow-camera-top={3} shadow-camera-bottom={-2.5} shadow-camera-near={.1} shadow-camera-far={15} shadow-bias={-.00015} shadow-normalBias={.012}/>
    <directionalLight position={[4,2.5,3]} intensity={lighting.fillPower} color={lighting.fill}/>
    <directionalLight position={[1.5,4,-4]} intensity={lighting.rimPower} color={lighting.rim}/>
    <group ref={storyGroup}>
    {groups.map((g,i)=><instancedMesh key={g.kind} ref={node=>{flowerMeshes.current[i]=node;}} args={[g.geometry,undefined,storyProgress ? Math.max(512,2**Math.ceil(Math.log2(Math.max(1,g.items.length)))) : g.items.length]} castShadow receiveShadow frustumCulled={false}><meshStandardMaterial vertexColors roughness={storyProgress ? .64 : .78} envMapIntensity={.08} metalness={0} side={THREE.DoubleSide}/></instancedMesh>)}
    <group ref={support}>{design.layers.map((layer,i)=>{const y=design.layers.slice(0,i).reduce((s,l)=>s+l.rise,0)*.01,coreHeight=layer.rise*.01*(i===design.layers.length-1?.65:1);return <mesh key={layer.id} position={[0,y+coreHeight*.5-.07,0]} receiveShadow><cylinderGeometry args={[Math.max(.008,(layer.radius-layer.width)*.01-.055),Math.max(.03,layer.radius*.01-.055),coreHeight,48]}/><meshStandardMaterial color="#344127" roughness={1}/></mesh>;})}</group>
    <mesh position={[0,-.01,0]} receiveShadow><cylinderGeometry args={[1.88,1.83,.065,96]}/><meshStandardMaterial color="#B69A60" metalness={.72} roughness={.32} envMapIntensity={.35}/></mesh>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,.025,0]}><torusGeometry args={[1.84,.035,8,96]}/><meshStandardMaterial color="#D5B979" metalness={.78} roughness={.28} envMapIntensity={.4}/></mesh>
    </group>
    <group name="studio-floor">
      {!storyProgress&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,-.048,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color={lighting.background} roughness={1} envMapIntensity={.15}/></mesh>}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.046,0]}><planeGeometry args={[5.2,5.2]}/><meshBasicMaterial map={contact} transparent depthWrite={false} toneMapped={false}/></mesh>
    </group>
  </>;
}
