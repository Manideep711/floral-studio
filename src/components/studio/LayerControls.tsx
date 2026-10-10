"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import {useState} from "react";
import {SelectionGroup,SelectionHighlight} from "../ui/selection-motion";
import type {Layer} from "@/lib/design/schema";
import FlowerPalette from "./FlowerPalette";
import Icon from "../ui/Icon";
import {Slider} from "../ui/slider";
import {Select} from "../ui/select";
import {Tabs,TabsList,TabsTrigger,TabsContent} from "../ui/tabs";
import {Tooltip} from "../ui/tooltip";
import {flowers,flowerById,type FlowerId} from "@/lib/flowers/catalog";
export default function LayerControls({layer,index,onChange,onBegin,onFinish,onReset}: {layer:Layer;index:number;onChange:(patch:Partial<Layer>,live?:boolean)=>void;onBegin:()=>void;onFinish:()=>void;onReset:()=>void}) {
  const {tr,locale}=useLanguage();
  const [tab,setTab]=useState("flowers");
  return <section className="control-panel" aria-label={tr(`Layer ${index+1} settings`)}>
    <div className="panel-title"><div><p className="eyebrow">{tr("Selected layer")}</p><h2>{tr("Layer")} {String(index+1).padStart(2,"0")}</h2></div><Tooltip text={tr("Reset layer")}><button className="icon-button" aria-label={tr("Reset selected layer")} onClick={onReset}><Icon name="reset" size={18}/></button></Tooltip></div>
    <Tabs value={tab} onValueChange={value=>{onFinish();setTab(value);}}>
      <SelectionGroup><TabsList aria-label={tr("Layer settings")}><TabsTrigger value="flowers">{tab==="flowers"&&<SelectionHighlight/>}{tr("Flowers")}</TabsTrigger><TabsTrigger value="shape">{tab==="shape"&&<SelectionHighlight/>}{tr("Shape")}</TabsTrigger><TabsTrigger value="accents">{tab==="accents"&&<SelectionHighlight/>}{tr("Accents")}{layer.accent&&<span className="tab-dot" aria-label={tr("Enabled")}/>}</TabsTrigger></TabsList></SelectionGroup>
      <TabsContent value="flowers"><FlowerPalette layer={layer} onChange={onChange}/></TabsContent>
      <TabsContent value="shape"><h3 className="field-heading">{tr("Shape")}</h3>
        {([{key:"radius",name:tr("Radius"),min:8,max:180,step:1,left:tr("Smaller"),right:tr("Wider")},{key:"width",name:tr("Band width"),min:8,max:Math.min(50,layer.radius),step:1,left:tr("Narrow"),right:tr("Broad")},{key:"rise",name:tr("Layer height"),min:10,max:40,step:1,left:tr("Low"),right:tr("Tall")},{key:"density",name:tr("Fullness"),min:.55,max:1.2,step:.01,left:tr("Airy"),right:tr("Lush")}] as const).map(s=>{
          const text=s.key==="density" ? `${Math.round(layer[s.key]*100)}%` : `${layer[s.key]}`;
          return <div className="slider-field" key={s.key}><div className="slider-title"><span>{tr(s.name)}</span><output>{text}</output></div><Slider label={tr(s.name)} valueText={text} min={s.min} max={s.max} step={s.step} value={[layer[s.key]]} onValueChange={([value])=>{onBegin();onChange({[s.key]:value},true);}} onValueCommit={onFinish} onKeyUp={onFinish} onPointerCancel={onFinish} onBlur={onFinish}/><div className="range-ends"><span>{tr(s.left)}</span><span>{tr(s.right)}</span></div></div>;
        })}
        <Select className="pattern-field" label={tr("Arrangement pattern")} value={layer.pattern} onValueChange={value=>onChange({pattern:value as Layer["pattern"]})} options={[{value:"staggered",label:tr("Staggered rings"),description:tr("Offset rows.")},{value:"rings",label:tr("Aligned rings"),description:tr("Even rows.")}]}/>
      </TabsContent>
      <TabsContent value="accents"><div className="accent-controls"><label className="accent-toggle"><input type="checkbox" checked={!!layer.accent} onChange={e=>onChange({accent:e.target.checked ? {flower:"tangedu",color:"#F8DC77",count:12} : undefined})}/> {tr("Add accents")}</label><p>{tr("Flowers spaced between layers.")}</p>{layer.accent&&<><Select className="pattern-field" label={tr("Accent flower")} value={layer.accent.flower} onValueChange={value=>{const flower=value as FlowerId;onChange({accent:{...layer.accent!,flower,color:flowerById(flower).colors[0].hex}});}} options={flowers.map(f=>({value:f.id,label:f.name}))}/><div className="swatches" role="group" aria-label={tr("Accent flower color")}>{flowerById(layer.accent.flower).colors.map(c=><button className={`swatch ${layer.accent!.color===c.hex ? "active" : ""}`} key={c.hex} style={{background:c.hex}} aria-label={`Accent ${tr(c.name)}`} aria-pressed={layer.accent!.color===c.hex} onClick={()=>onChange({accent:{...layer.accent!,color:c.hex}})}>{layer.accent!.color===c.hex&&<Icon name="check" size={17}/>}</button>)}</div><Select className="pattern-field" label={tr("Number of accents")} value={String(layer.accent.count)} onValueChange={value=>onChange({accent:{...layer.accent!,count:Number(value)}})} options={Array.from({length:21},(_,i)=>({value:String(i+4),label:`${i+4} flowers`}))}/></>}</div></TabsContent>
    </Tabs>
  </section>;
}
