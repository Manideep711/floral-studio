"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import {Component,useCallback,useEffect,useRef,useState,type ReactNode} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {motion,useScroll,useTransform,useReducedMotion,useMotionValue} from "motion/react";
import {guidedDesign,GUIDED_KEY} from "@/lib/design/guided";
import {templates,templateDesign} from "@/lib/design/templates";
import type {Design} from "@/lib/design/schema";
import ArrangementCanvas from "../studio/ArrangementCanvas";
import {GridPattern} from "../ui/grid-pattern";
import {TextAnimate} from "../ui/text-animate";
import Icon from "../ui/Icon";
import {MotionMorphyButton} from "../ui/morphy-button";
import {SlidingChoices} from "../ui/sliding-choices";
import GrowingTitle from "./GrowingTitle";
import IconTrailButton from "../tweenui/icon-trail-button";
import {useStoryGate} from "./useStoryGate";
const Scene=dynamic(()=>import("../three/BathukammaScene"),{ssr:false});
const skip={type:"skip" as const,id:0};
const nothing=()=>{};
class StoryBoundary extends Component<{children:ReactNode;fallback:ReactNode;onFailure:()=>void},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed ? this.props.fallback : this.props.children;}
}
const headingEntrance={hidden:{opacity:0,x:-36,filter:"blur(3px)"},show:{opacity:1,x:0,filter:"blur(0px)",transition:{duration:.7,ease:[.22,1,.36,1] as const}}};
const wordEntrance={hidden:{opacity:0,y:18,filter:"blur(8px)"},show:{opacity:1,y:0,filter:"blur(0px)",transition:{duration:.55,ease:[.22,1,.36,1] as const}}};
const chapters=[
  {title:"Start with Tangedu",copy:"Place Tangedu around the base.",action:"Place Tangedu"},
  {title:"Add Gunugu",copy:"Make this circle a little smaller.",action:"Add Gunugu"},
  {title:"Add Banti",copy:"Add a band of marigolds.",action:"Add Banti"},
  {title:"Finish the top",copy:"Add the last two layers.",action:"Finish"}
];
export default function FlowerStory(){
  const {tr,locale}=useLanguage();
  const root=useRef<HTMLDivElement>(null),chapterRefs=useRef<Array<HTMLElement|null>>([]);
  const [step,setStep]=useState(0),[design,setDesign]=useState<Design>(()=>guidedDesign());
  const canCustomise=step===4;
  const [selectedTemplate,setSelectedTemplate]=useState("");
  const [heroDelay,setHeroDelay]=useState(2.35);
  useEffect(()=>{const timer=setTimeout(()=>setHeroDelay(0),3400);return ()=>clearTimeout(timer);},[]);
  const [supported,setSupported]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState("");
  const reduced=useReducedMotion();
  const beginStory=useStoryGate(root,step,reduced);
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
    <GridPattern className="story-grid" width={40} height={40}/>
    <div className="story-copy">
      <section className="story-intro" aria-labelledby="home-title"><p className="eyebrow"><TextAnimate as="span" variants={headingEntrance} by="text" startOnView={false} delay={heroDelay} key={`${locale}-eyebrow`}>{tr("Bathukamma")}</TextAnimate></p><h1 id="home-title"><TextAnimate as="span" variants={headingEntrance} by="text" startOnView={false} delay={heroDelay} duration={.1} key={`${locale}-intro`}>{tr("Make a")}</TextAnimate><br/><em><GrowingTitle delay={heroDelay+.85}><TextAnimate as="span" variants={headingEntrance} by="text" startOnView={false} delay={heroDelay+.12} duration={.1} key={`${locale}-title`}>{tr("Bathukamma.")}</TextAnimate></GrowingTitle></em></h1><p className="hero-description"><TextAnimate as="span" variants={wordEntrance} by="word" startOnView={false} delay={heroDelay+.22} duration={.48} key={`${locale}-description`}>{tr("Choose flowers. Build one layer at a time.")}</TextAnimate></p><IconTrailButton href="#story-layer-1" onClick={e=>{e.preventDefault();beginStory();}} className="primary-button story-trail-cta"><TextAnimate as="span" variants={wordEntrance} by="word" startOnView={false} delay={heroDelay+.42} duration={.24} key={`${locale}-cta`}>{tr("Start arranging")}</TextAnimate></IconTrailButton><p className="hero-meta"><TextAnimate as="span" variants={wordEntrance} by="word" startOnView={false} delay={heroDelay+.58} duration={.24} key={`${locale}-meta`}>{tr("No sign-in needed.")}</TextAnimate></p><div className="hero-signature"><span lang="te"><TextAnimate as="span" variants={headingEntrance} by="text" startOnView={false} delay={heroDelay+.6}>బతుకమ్మ</TextAnimate></span><span><TextAnimate as="span" variants={wordEntrance} by="word" startOnView={false} delay={heroDelay+.66} duration={.24} key={`${locale}-festival`}>{tr("Telangana’s flower festival")}</TextAnimate></span></div></section>
      {chapters.map((chapter,i)=><motion.section initial={reduced ? false : "hidden"} whileInView={i<=step ? "visible" : "hidden"} viewport={{once:true,amount:.3}} variants={{hidden:{opacity:0,x:i%2===0 ? 32 : -32,filter:"blur(4px)"},visible:{opacity:1,x:0,filter:"blur(0px)",transitionEnd:{filter:"none",transform:"none"}}}} transition={{duration:reduced ? 0 : .5,ease:[.22,1,.36,1]}} key={chapter.title} tabIndex={-1} inert={i>step} aria-hidden={i>step} id={`story-layer-${i+1}`} ref={el=>{chapterRefs.current[i]=el;}} className={`story-chapter ${step===i ? "current" : ""}`} aria-labelledby={`chapter-${i}`}>
        {i<=step&&<><p className="eyebrow">{tr("Layer")} {String(i+1).padStart(2,"0")}</p><h2 id={`chapter-${i}`}><TextAnimate key={`${locale}-${i}`} as="span" variants={{hidden:{opacity:0,x:i%2===0 ? -20 : 20,filter:"blur(3px)"},show:{opacity:1,x:0,filter:"blur(0px)",transition:{duration:.5,ease:[.22,1,.36,1]}}}} by="text" once duration={.5}>{tr(chapter.title)}</TextAnimate></h2><p><TextAnimate as="span" key={`${locale}-${i}-copy`} variants={wordEntrance} by="word" once delay={.12} duration={.5}>{tr(chapter.copy)}</TextAnimate></p><MotionMorphyButton initial={reduced ? false : {opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.5,delay:.2,ease:[.22,1,.36,1]}} size="lg" placed={step>i} actionDelay={500} disabled={step!==i} onClick={()=>advance(i+1)}>{step>i ? tr("Placed") : tr(chapter.action)}{step>i&&<Icon name="check" size={16}/>}</MotionMorphyButton>{step<=i&&<p className="story-step-hint">{tr("Place the layer to continue.")}</p>}</>}
      </motion.section>)}
      <section className="story-finish" inert={step<4} aria-hidden={step<4} tabIndex={-1} id="story-finish" aria-labelledby="story-finish-title"><p className="eyebrow">{tr("Next")}</p><h2 id="story-finish-title"><TextAnimate key={`${locale}-finish`} as="span" variants={headingEntrance} by="text" once duration={.1}>{tr("Choose a template.")}</TextAnimate><br/><TextAnimate key={`${locale}-finish-edit`} as="span" variants={headingEntrance} by="text" once delay={.15}>{tr("Or keep editing.")}</TextAnimate></h2><p>{tr("Change the size, height or flowers in the studio.")}</p><SlidingChoices className="story-templates" label={tr("Starter sizes")} value={selectedTemplate}>{templates.slice(0,4).map(t=><button key={t.id} aria-pressed={selectedTemplate===t.id} disabled={step<4} onClick={()=>{setSelectedTemplate(t.id);setDesign(templateDesign(t.id));}}><strong>{tr(t.name)}</strong><span>{tr(`${t.layers} layers`)}</span></button>)}</SlidingChoices>
        {canCustomise ? <><Link href="/studio/?guided=1" className="primary-button" onClick={e=>{try{sessionStorage.setItem(GUIDED_KEY,JSON.stringify(design));}catch{e.preventDefault();setError("Could not transfer your arrangement. You can still open the studio and choose a template.");}}}>{tr("Edit in studio")} <Icon name="arrow" size={18}/></Link><p className="hero-meta">{tr("Undo restores your previous draft.")}</p></> : <p className="story-step-hint">{tr("Finish the layers to continue.")}</p>}
        <p role="status">{tr(error)}</p><p className="story-tradition">{tr("Flower choices vary by family.")}</p>
      </section>
    </div>
    <aside className="story-visual-track" aria-label={tr("Live Bathukamma preview")}><motion.figure className="story-visual" style={{x:reduced ? 0 : sideways,y:reduced ? 0 : downward}}><div className="story-visual-heading"><span role="status">{step===0 ? tr("Your Bathukamma") : tr(`${design.layers.length} layers`)}</span><span>{tr("3D preview")}</span></div><div className="story-sculpture" role="img" aria-label={tr(`${design.layers.length} layers`)}>
      {supported&&<StoryBoundary fallback={fallback} onFailure={failed}><Scene design={design} reducedMotion command={skip} lowQuality onPhase={nothing} onMetrics={nothing} onReady={loaded} onFailure={failed} storyProgress={reduced ? still : rotation}/></StoryBoundary>}
      {(!supported||!ready)&&<div className="story-sculpture-fallback">{fallback}</div>}
    </div></motion.figure></aside>
  </div>;
}
