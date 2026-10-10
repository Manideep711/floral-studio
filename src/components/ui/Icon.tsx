import LogoMark from "./LogoMark";
export default function Icon({name,size=20}: {name:string;size?:number}) {
  if(name==="flower")return <LogoMark size={size}/>;
  const paths:Record<string,React.ReactNode> = {
    arrow:<><path d="M4 12h15M13 6l6 6-6 6"/></>,
    undo:<><path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12"/></>,
    redo:<><path d="m15 5 5 5-5 5M20 10H10a6 6 0 0 0 0 12"/></>,
    plus:<path d="M12 5v14M5 12h14"/>,
    reset:<><path d="M4 4v6h6M4 10a8 8 0 1 1 0 5"/></>,
    download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
    check:<path d="m5 12 4 4 10-10"/>,
    close:<path d="m6 6 12 12M6 18 18 6"/>,
    up:<path d="m6 15 6-6 6 6"/>,down:<path d="m6 9 6 6 6-6"/>,
    trash:<><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>,
    info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></>,
    leaf:<><path d="M19 4C7 2 1 10 7 16s14-1 12-12ZM5 20 16 7"/></>
  };
  if(!paths[name])return <LogoMark size={size}/>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
