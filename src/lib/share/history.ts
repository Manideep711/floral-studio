export type History<T> = {present:T; past:T[]; future:T[]; baseline:T|null};
export type HistoryAction<T> = {type:"edit"; update:(value:T)=>T}|{type:"reset"; value:T}|{type:"begin"|"end"|"undo"|"redo"};
export function createHistory<T>(present:T):History<T>{return {present,past:[],future:[],baseline:null};}
function finish<T>(state:History<T>):History<T>{
 if(state.baseline===null)return state;
 return {...state,baseline:null,past:state.baseline===state.present?state.past:[...state.past,state.baseline].slice(-50)};
}
export function cardHistory<T>(state:History<T>,action:HistoryAction<T>):History<T>{
 if(action.type==="reset")return createHistory(action.value);
 if(action.type==="begin")return state.baseline===null?{...state,baseline:state.present}:state;
 if(action.type==="end")return finish(state);
 if(action.type==="edit"){
  const present=action.update(state.present);
  if(present===state.present)return state;
  return {...state,present,future:[],past:state.baseline===null?[...state.past,state.present].slice(-50):state.past};
 }
 const settled=finish(state);
 if(action.type==="undo"){
  if(!settled.past.length)return settled;
  return {...settled,present:settled.past.at(-1)!,past:settled.past.slice(0,-1),future:[settled.present,...settled.future]};
 }
 if(!settled.future.length)return settled;
 return {...settled,present:settled.future[0],past:[...settled.past,settled.present].slice(-50),future:settled.future.slice(1)};
}
