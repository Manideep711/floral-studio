import type { Design } from "./schema";
export type History = {past:Design[];present:Design;future:Design[]};
export const initialHistory = (design:Design):History => ({past:[],present:design,future:[]});
export function commit(history:History,design:Design):History {
  if(JSON.stringify(history.present)===JSON.stringify(design)) return history;
  return {past:[...history.past,history.present].slice(-60),present:design,future:[]};
}
export function undo(history:History):History {
  if(!history.past.length) return history;
  return {past:history.past.slice(0,-1),present:history.past.at(-1)!,future:[history.present,...history.future]};
}
export function redo(history:History):History {
  if(!history.future.length) return history;
  return {past:[...history.past,history.present],present:history.future[0],future:history.future.slice(1)};
}
