/** Reuse a completed render only for the same capture and immutable settings snapshot. */
export function createCardExport<T>(render:(image:Blob,settings:T,onProgress:(message:string)=>void)=>Promise<Blob>){
 let cached:{image:Blob;settings:T;result:Promise<Blob>}|null=null;
 return (image:Blob,settings:T,onProgress:(message:string)=>void)=>{
  if(cached?.image===image&&cached.settings===settings){onProgress("Preparing your file…");return cached.result;}
  const result=Promise.resolve().then(()=>render(image,settings,onProgress));
  const entry={image,settings,result};cached=entry;
  void result.catch(()=>{if(cached===entry)cached=null;});
  return result;
 };
}
