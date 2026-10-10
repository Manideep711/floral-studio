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
  const [tab,setTab]=useState("flowers");
  return <section className="control-panel" aria-label={`Layer ${index+1} settings`}>
    <div className="panel-title"><div><p className="eyebrow">Selected layer</p><h2>Layer {String(index+1).padStart(2,"0")}</h2></div><Tooltip text="Reset this layer to its original settings"><button className="icon-button" aria-label="Reset selected layer" onClick={onReset}><Icon name="reset" size={18}/></button></Tooltip></div>
    <Tabs value={tab} onValueChange={value=>{onFinish();setTab(value);}}>
      <SelectionGroup><TabsList aria-label="Layer settings"><TabsTrigger value="flowers">{tab==="flowers"&&<SelectionHighlight/>}Flowers</TabsTrigger><TabsTrigger value="shape">{tab==="shape"&&<SelectionHighlight/>}Shape</TabsTrigger><TabsTrigger value="accents">{tab==="accents"&&<SelectionHighlight/>}Accents{layer.accent&&<span className="tab-dot" aria-label="Enabled"/>}</TabsTrigger></TabsList></SelectionGroup>
      <TabsContent value="flowers"><FlowerPalette layer={layer} onChange={onChange}/><p className="panel-help">Choose Shape to adjust width, height and fullness.</p></TabsContent>
      <TabsContent value="shape"><h3 className="field-heading">Shape & fullness</h3>
        {([{key:"radius",name:"Radius",min:8,max:180,step:1,left:"Smaller",right:"Wider"},{key:"width",name:"Band width",min:8,max:Math.min(50,layer.radius),step:1,left:"Narrow",right:"Broad"},{key:"rise",name:"Layer height",min:10,max:40,step:1,left:"Low",right:"Tall"},{key:"density",name:"Fullness",min:.55,max:1.2,step:.01,left:"Airy",right:"Lush"}] as const).map(s=>{
          const text=s.key==="density" ? `${Math.round(layer[s.key]*100)}%` : `${layer[s.key]}`;
          return <div className="slider-field" key={s.key}><div className="slider-title"><span>{s.name}</span><output>{text}</output></div><Slider label={s.name} valueText={text} min={s.min} max={s.max} step={s.step} value={[layer[s.key]]} onValueChange={([value])=>{onBegin();onChange({[s.key]:value},true);}} onValueCommit={onFinish} onKeyUp={onFinish} onPointerCancel={onFinish} onBlur={onFinish}/><div className="range-ends"><span>{s.left}</span><span>{s.right}</span></div></div>;
        })}
        <Select className="pattern-field" label="Arrangement pattern" value={layer.pattern} onValueChange={value=>onChange({pattern:value as Layer["pattern"]})} options={[{value:"staggered",label:"Staggered rings",description:"Offset rows for a fuller, natural band."},{value:"rings",label:"Aligned rings",description:"Even rows for a neat, repeating pattern."}]}/>
      </TabsContent>
      <TabsContent value="accents"><div className="accent-controls"><label className="accent-toggle"><input type="checkbox" checked={!!layer.accent} onChange={e=>onChange({accent:e.target.checked ? {flower:"tangedu",color:"#F8DC77",count:12} : undefined})}/> Add spaced accent flowers</label><p>Larger flowers placed evenly along this layer’s upper edge, between the bands.</p>{layer.accent&&<><Select className="pattern-field" label="Accent flower" value={layer.accent.flower} onValueChange={value=>{const flower=value as FlowerId;onChange({accent:{...layer.accent!,flower,color:flowerById(flower).colors[0].hex}});}} options={flowers.map(f=>({value:f.id,label:f.name}))}/><div className="swatches" role="group" aria-label="Accent flower color">{flowerById(layer.accent.flower).colors.map(c=><button className={`swatch ${layer.accent!.color===c.hex ? "active" : ""}`} key={c.hex} style={{background:c.hex}} aria-label={`Accent ${c.name}`} aria-pressed={layer.accent!.color===c.hex} onClick={()=>onChange({accent:{...layer.accent!,color:c.hex}})}>{layer.accent!.color===c.hex&&<Icon name="check" size={17}/>}</button>)}</div><Select className="pattern-field" label="Number of accents" value={String(layer.accent.count)} onValueChange={value=>onChange({accent:{...layer.accent!,count:Number(value)}})} options={Array.from({length:21},(_,i)=>({value:String(i+4),label:`${i+4} flowers`}))}/></>}</div></TabsContent>
    </Tabs>
  </section>;
}
