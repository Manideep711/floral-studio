import {LOGO_PATH,LOGO_VIEWBOX} from "@/lib/brand/logo";
export default function LogoMark({size=26}:{size?:number}) {
 return <svg className="brand-emblem" width={size} height={size} viewBox={LOGO_VIEWBOX} fill="currentColor" aria-hidden="true">
  <path d={LOGO_PATH}/>
 </svg>;
}
