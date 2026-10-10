import {defaultDesign} from "./defaults";
import type {Design} from "./schema";
export const GUIDED_KEY="bathukamma:guided:v1";
// The guide follows the Tangedu-base family tradition. Free arranging remains
// available, and ritual finishing elements are described rather than invented.
export function guidedDesign(step=4):Design {
  const design=defaultDesign();
  const flowers=[{flower:"tangedu",color:"#F2C643"},{flower:"gunugu",color:"#EEE4D7"},{flower:"banti",color:"#E98333"},{flower:"gunugu",color:"#DCA7BA"},{flower:"banti",color:"#F3CE49"}] as const;
  design.layers=design.layers.slice(0,step===4 ? 5 : Math.max(1,step)).map((layer,i)=>({...layer,...flowers[i]}));
  return design;
}
