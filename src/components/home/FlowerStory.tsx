"use client";
import {Component,useCallback,useEffect,useRef,useState,type ReactNode} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {motion,useScroll,useTransform,useReducedMotion,useMotionValue} from "motion/react";
import {guidedDesign,GUIDED_KEY} from "@/lib/design/guided";
import {templates,templateDesign} from "@/lib/design/templates";
import type {Design} from "@/lib/design/schema";
import ArrangementCanvas from "../studio/ArrangementCanvas";
import Icon from "../ui/Icon";
import {useStoryGate} from "./useStoryGate";
const Scene=dynamic(()=>import("../three/BathukammaScene"),{ssr:false});
const skip={type:"skip" as const,id:0};
const nothing=()=>{};
class StoryBoundary extends Component<{children:ReactNode;fallback:ReactNode;onFailure:()=>void},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed ? this.props.fallback : this.props.children;}
}
const chapters=[
  {title:"Begin with Tangedu.",copy:"In this family tradition, yellow Tangedu forms the wide base. Place the first circular band on the plate.",action:"Place Tangedu"},
  {title:"Build with Gunugu.",copy:"A soft, densely flowered band rests above the base. Keep its circle a little smaller, letting the shape taper.",action:"Add Gunugu"},
  {title:"Bring in Banti.",copy:"Full marigold heads add warmth and texture. Layer by layer, a flat circle becomes a flower mound.",action:"Add Banti"},
  {title:"Rise towards the crown.",copy:"Add two smaller bands to complete this floral study. Traditional finishing elements, including the pumpkin flower and turmeric Gouramma, vary by family and are not yet modelled here.",action:"Finish the flower layers"}
];
export default function FlowerStory(){
  const root=useRef<HTMLDivElement>(null),chapterRefs=useRef<Array<HTMLElement|null>>([]);
  const [step,setStep]=useState(0),[design,setDesign]=useState<Design>(()=>guidedDesign());
  const canCustomise=step===4;
  const [supported,setSupported]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState("");
  const reduced=useReducedMotion();
  useStoryGate(root,step,reduced);
  const {scrollYProgress}=useScroll({target:root,offset:["start start","end end"]});
  const progress=scrollYProgress;
  const still=useMotionValue(0);
  const distance=useMotionValue(0),stops=useRef<number[]>([0,1]);
  const chapterProgress=useTransform(()=>{
    const p=Math.max(0,Math.min(1,progress.get()));distance.get();
    const points=stops.current;
    let i=0;while(i<points.length-2&&p>points[i+1])i++;
    // Both coordinates share this uninterrupted progress: no vertical-only leg or pause.
    const t=Math.max(0,Math.min(1,(p-points[i])/Math.max(.001,points[i+1]-points[i])));
    return i+t;
  });
  const side=useTransform(()=>{
    const value=chapterProgress.get(),i=Math.floor(value),t=value-i;
    return i%2===0 ? t : 1-t;
  });
  const rotation=useTransform(()=>{
    const value=chapterProgress.get(),i=Math.floor(value),t=value-i;
    const eased=t*t*t*(t*(t*6-15)+10);
    return (i+eased)/Math.max(1,stops.current.length-1);
  });
  const sideways=useTransform(()=>-distance.get()*side.get());
  const downward=useTransform(side,[0,1],[0,12]);
  useEffect(()=>{
    const element=root.current;if(!element)return;
    const measure=()=>{
      const length=Math.max(1,element.offsetHeight-window.innerHeight);
      stops.current=Array.from(element.querySelectorAll<HTMLElement>(".story-copy>section")).map((section,i)=>i===0 ? 0 : Math.min(1,Math.max(0,(section.offsetTop-32)/length)));
      const visual=element.querySelector<HTMLElement>(".story-visual");
      distance.set(visual ? Math.max(0,visual.offsetLeft-32) : 0);
    };
    const observer=new ResizeObserver(measure);observer.observe(element);
    window.addEventListener("resize",measure);measure();
    return ()=>{observer.disconnect();window.removeEventListener("resize",measure);};
  },[distance]);
  useEffect(()=>setSupported(true),[]);
  const loaded=useCallback(()=>setReady(true),[]),failed=useCallback(()=>setSupported(false),[]);
  const advance=(next:number)=>{
    if(next!==step+1||step>=4)return;
    setStep(next);setDesign(guidedDesign(next));
  };
  const fallback=<ArrangementCanvas design={design} selected="" onSelect={nothing} profile/>;
  return <div ref={root} className="flower-story" data-guided-step={step}>
    <div className="story-copy">
      <section className="story-intro" aria-labelledby="home-title"><p className="eyebrow">A floral tradition. Your own creation.</p><h1 id="home-title">A little flower.<br/>A whole <em>celebration.</em></h1><p className="hero-description">Build your own Bathukamma, one circle at a time. Follow the guide and place each layer, from a golden base to a colourful crown.</p><a href="#story-layer-1" className="primary-button"><Icon name="flower" size={18}/>Arrange with me <Icon name="arrow" size={18}/></a><Link href="/studio/" className="text-button story-skip">Go straight to the studio</Link><p className="hero-meta">No account needed. Your existing draft stays safe.</p><div className="hero-signature"><span lang="te">బతుకమ్మ</span><span>A celebration of Telangana</span></div></section>
      {chapters.map((chapter,i)=><motion.section initial={reduced ? false : {opacity:0,y:16}} whileInView={{opacity:i>step ? 0 : 1,y:reduced || i<=step ? 0 : 16}} viewport={{once:true,amount:.2}} transition={{duration:.5,ease:[.22,1,.36,1]}} key={chapter.title} tabIndex={-1} inert={i>step} aria-hidden={i>step} id={`story-layer-${i+1}`} ref={el=>{chapterRefs.current[i]=el;}} className={`story-chapter ${step===i ? "current" : ""}`} aria-labelledby={`chapter-${i}`}>
        <p className="eyebrow">Layer by layer / {String(i+1).padStart(2,"0")}</p><h2 id={`chapter-${i}`}>{chapter.title}</h2><p>{chapter.copy}</p><button className={step>i ? "secondary-button" : "primary-button"} disabled={step!==i} onClick={()=>advance(i+1)}>{step>i ? "Placed" : chapter.action}{step>i&&<Icon name="check" size={16}/>}</button>{step<=i&&<p className="story-step-hint">Place this layer to unlock scrolling to the next.</p>}
      </motion.section>)}
      <section className="story-finish" inert={step<4} aria-hidden={step<4} tabIndex={-1} id="story-finish" aria-labelledby="story-finish-title"><p className="eyebrow">Make it yours</p><h2 id="story-finish-title">Your flowers.<br/>Your proportions.</h2><p>Keep arranging freely, or choose a different size to start from.</p><div className="story-templates" role="group" aria-label="Starter sizes">{templates.slice(0,4).map(t=><button key={t.id} disabled={step<4} onClick={()=>setDesign(templateDesign(t.id))}><strong>{t.name}</strong><span>{t.layers} layers</span></button>)}</div>
        {canCustomise ? <><Link href="/studio/?guided=1" className="primary-button" onClick={e=>{try{sessionStorage.setItem(GUIDED_KEY,JSON.stringify(design));}catch{e.preventDefault();setError("Could not transfer your arrangement. You can still open the studio and choose a template.");}}}>Customise this arrangement <Icon name="arrow" size={18}/></Link><p className="hero-meta">Replaces the studio arrangement. Undo restores your previous draft.</p></> : <p className="story-step-hint">Complete each layer to unlock templates and customisation.</p>}
        <p role="status">{error}</p><p className="story-tradition">Inspired by a family way of arranging. Flowers and finishing traditions vary across Telangana.</p>
      </section>
    </div>
    <aside className="story-visual-track" aria-label="Live Bathukamma preview"><motion.figure className="story-visual" style={{x:reduced ? 0 : sideways,y:reduced ? 0 : downward}}><div className="story-visual-heading"><span role="status">{step===0 ? "From flowers to form" : `${design.layers.length} ${design.layers.length===1 ? "layer" : "layers"}, in your arrangement`}</span><span>3D flower study</span></div><div className="story-sculpture" role="img" aria-label={`${design.layers.length}-layer Bathukamma sculpture`}>
      {supported&&<StoryBoundary fallback={fallback} onFailure={failed}><Scene design={design} reducedMotion command={skip} lowQuality onPhase={nothing} onMetrics={nothing} onReady={loaded} onFailure={failed} storyProgress={reduced ? still : rotation}/></StoryBoundary>}
      {(!supported||!ready)&&<div className="story-sculpture-fallback">{fallback}</div>}
    </div><figcaption>{step===0 ? "Scroll to follow the flowers." : "Use the layer button to add the next circle."}</figcaption></motion.figure></aside>
  </div>;
}
