import FlowerArt from "../flowers/FlowerArt";
import {flowers,flowerById,type FlowerId} from "@/lib/flowers/catalog";
import type {Layer} from "@/lib/design/schema";
import Icon from "../ui/Icon";
export default function FlowerPalette({layer,onChange}: {layer:Layer;onChange:(patch:Partial<Layer>)=>void}) {
  const selected=flowerById(layer.flower);
  return <>
    <div className="field-heading"><span>Flower variety</span><span className="muted">{flowers.length} flower varieties</span></div>
    <div className="flower-options" role="group" aria-label="Flower variety">
      {flowers.map(f=><button key={f.id} className={`flower-option ${layer.flower===f.id ? "active" : ""}`} aria-pressed={layer.flower===f.id} onClick={()=>onChange({flower:f.id as FlowerId,color:f.colors[0].hex})}>
        <FlowerArt kind={f.id} color={f.colors[0].hex} size={48}/><span className="flower-option-label"><strong>{f.name}</strong><span lang="te">{f.telugu}</span></span>{layer.flower===f.id && <span className="flower-check"><Icon name="check" size={12}/></span>}
      </button>)}
    </div>
    <div className="field-heading"><span>Flower color</span><span className="muted">{selected.colors.find(c=>c.hex===layer.color)?.name}</span></div>
    <div className="swatches" role="group" aria-label="Flower color">{selected.colors.map(c=><button key={c.hex} style={{"--swatch":c.hex} as React.CSSProperties} className={`swatch ${c.hex===layer.color ? "active" : ""}`} aria-label={c.name} aria-pressed={c.hex===layer.color} title={c.name} onClick={()=>onChange({color:c.hex})}>{c.hex===layer.color && <Icon name="check" size={17}/>}</button>)}</div>
    {selected.colors.find(c=>c.hex===layer.color)?.creative && <p className="creative-note">Decorative color · inspired by colored Gunugu arrangements.</p>}
    <details className="botanical-note"><summary>About {selected.name}</summary><em>{selected.botanical}</em><p>{selected.description}</p></details>
  </>;
}
