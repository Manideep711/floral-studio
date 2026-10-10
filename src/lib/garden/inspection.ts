export const CLOSE_VIEW_DISTANCE=10;
export const DETAIL_VIEW_DISTANCE=14;
export function detailCandidates(candidates:readonly {id:string;distance:number;onScreen:boolean;count:number}[],light:boolean,retained:readonly string[]=[]){
 let budget=light ? 700 : 1600;
 const result:string[]=[];
 for(const candidate of candidates.filter(c=>c.onScreen&&c.distance<=DETAIL_VIEW_DISTANCE+(retained.includes(c.id) ? 3 : 0)).slice().sort((a,b)=>(a.distance-(retained.includes(a.id)?1:0))-(b.distance-(retained.includes(b.id)?1:0)))){
  if(result.length>=(light ? 2 : 4))break;
  if(candidate.count<=budget||(result.length===0&&candidate.distance<=CLOSE_VIEW_DISTANCE)){
   result.push(candidate.id);budget-=candidate.count;
  }
 }
 return result;
}
export function canInspect(distance:number,detailed:boolean,onScreen:boolean){return detailed&&onScreen&&distance<=CLOSE_VIEW_DISTANCE;}
export const GARDEN_COPY_KEY="bathukamma:garden-copy:v1";
export function isOwnedEntry(id:string,owned:readonly {id:string}[]){return owned.some(entry=>entry.id===id);}
