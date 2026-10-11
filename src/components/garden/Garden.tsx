"use client";
import {useLanguage} from "@/lib/i18n/LanguageProvider";
import SiteHeader from "../ui/SiteHeader";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {gardenThumbnail} from "@/lib/garden/thumbnail";
import {GARDEN_COPY_KEY} from "@/lib/garden/inspection";
import {useCallback,useEffect,useRef,useState} from "react";
import type {User} from "@supabase/supabase-js";
import Icon from "../ui/Icon";
import {Tabs,TabsList,TabsTrigger} from "../ui/tabs";
import ArrangementSvg from "../studio/ArrangementSvg";
import FestivalCanvas from "./FestivalCanvas";
import {gardenClient} from "@/lib/garden/client";
import {PENDING_KEY,parseEntry,parsePending,publicSnapshot,sampleEntries,type GardenEntry} from "@/lib/garden/model";
import type {Design} from "@/lib/design/schema";
import {hexCell,hexDistance,mergeNeighborhood,NEIGHBOR_RADIUS,type HexCell} from "@/lib/garden/spatial";
const columns="id,slot,title,creator_name,design,created_at";
export default function Garden(){
  const {tr,locale}=useLanguage();
  const router=useRouter();
  const [focus,setFocus]=useState<{slot:number;id:number}>();
  const focusedOwner=useRef<string|null>(null);
  const [entries,setEntries]=useState<GardenEntry[]>([]),[user,setUser]=useState<User|null>(null),[configured,setConfigured]=useState<boolean|null>(null),[authReady,setAuthReady]=useState(false);
  const [pending,setPending]=useState<Design|null>(null),[panel,setPanel]=useState<"publish"|"account">("publish");
  const [title,setTitle]=useState("My Bathukamma"),[name,setName]=useState(""),[consent,setConsent]=useState(false),[email,setEmail]=useState("");
  const [password,setPassword]=useState(""),[confirmPassword,setConfirmPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [authMode,setAuthMode]=useState<"signin"|"signup"|"reset"|"recovery">("signin");
  const [notice,setNotice]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[mine,setMine]=useState<GardenEntry[]>([]),[removeId,setRemoveId]=useState<string|null>(null);
  const dialog=useRef<HTMLDialogElement>(null),request=useRef(0);
  const [anchor,setAnchor]=useState(1);const anchorRef=useRef(1),lastCell=useRef<HexCell|null>(null),neighborhoodTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const neighborhood=useCallback(async(cell:HexCell,reset=false)=>{
    const ticket=++request.current;lastCell.current=cell;setLoading(true);setError("");
    try{
      const client=gardenClient();let valid:GardenEntry[];
      if(!client){const templates=sampleEntries();valid=Array.from({length:217},(_,i)=>i+1).filter(slot=>hexDistance(hexCell(slot),cell)<=NEIGHBOR_RADIUS).map(slot=>({...templates[(slot-1)%templates.length],id:`sample-${slot}`,slot}));}
      else {const {data,error}=await client.rpc("garden_nearby",{center_q:cell.q,center_r:cell.r,radius:NEIGHBOR_RADIUS}).select(columns);if(error)throw error;valid=(Array.isArray(data) ? data : []).map(parseEntry).filter((e:GardenEntry|null):e is GardenEntry=>e!==null);}
      if(ticket!==request.current)return;setEntries(old=>mergeNeighborhood(reset ? [] : old.filter(e=>hexDistance(hexCell(e.slot),cell)>NEIGHBOR_RADIUS),valid));
    }catch{if(ticket===request.current){lastCell.current=null;setError("We couldn’t load this neighborhood. Retry with Refresh garden. Check that the spatial database upgrade is installed.");}}finally{if(ticket===request.current)setLoading(false);}
  },[]);
  const focusEntry=useCallback((entry:GardenEntry)=>{anchorRef.current=entry.slot;setAnchor(entry.slot);setFocus(old=>({slot:entry.slot,id:(old?.id||0)+1}));void neighborhood(hexCell(entry.slot),true);},[neighborhood]);
  const load=useCallback(async(reset=true)=>{
    if(neighborhoodTimer.current)clearTimeout(neighborhoodTimer.current);
    if(reset){const client=gardenClient();if(client){setLoading(true);const {data,error}=await client.from("garden_entries").select("slot").eq("hidden",false).order("slot",{ascending:false}).limit(1);if(error){setError("We couldn’t refresh the garden. Please try again.");setLoading(false);return;}anchorRef.current=data?.[0]?.slot||1;setAnchor(anchorRef.current);}}
    await neighborhood(reset ? hexCell(anchorRef.current) : lastCell.current||hexCell(anchorRef.current),reset);
  },[neighborhood]);
  const movedNeighborhood=useCallback((cell:HexCell)=>{
    if(lastCell.current&&hexDistance(lastCell.current,cell)<2)return;
    if(neighborhoodTimer.current)clearTimeout(neighborhoodTimer.current);
    neighborhoodTimer.current=setTimeout(()=>void neighborhood(cell),450);
  },[neighborhood]);
  useEffect(()=>()=>{if(neighborhoodTimer.current)clearTimeout(neighborhoodTimer.current);request.current++;},[]);
  const loadMine=useCallback(async()=>{const client=gardenClient();if(!client)return;const {data,error}=await client.from("garden_entries").select(columns).order("slot",{ascending:false}).eq("owner_id",user?.id||"");if(error){setError("Couldn’t load your published flowers. Please try again.");return;}setMine((data||[]).map(parseEntry).filter((e):e is GardenEntry=>e!==null));},[user?.id]);
  useEffect(()=>{
    let alive=true;const client=gardenClient();setConfigured(!!client);
    try{const d=parsePending(localStorage.getItem(PENDING_KEY));setPending(d);if(d)setTitle(d.personalization.title||"My Bathukamma");if(new URLSearchParams(window.location.search).has("publish"))dialog.current?.showModal();}catch{setNotice("Your browser couldn’t restore the design for publication. Your studio draft is separate.");}
    if(!client){void load();setAuthReady(true);return;}
    const {data:{subscription}}=client.auth.onAuthStateChange((event,session)=>{if(alive){setUser(session?.user||null);setAuthReady(true);setConsent(false);if(event==="PASSWORD_RECOVERY"){setAuthMode("recovery");setPassword("");setConfirmPassword("");dialog.current?.showModal();}}});
    client.auth.initialize().then(async({error:initError})=>{const {data,error}=await client.auth.getSession();if(!alive)return;setUser(data.session?.user||null);setAuthReady(true);if(initError||error)setError("Sign-in couldn’t finish. Please try again. Open confirmation or reset links in the same browser.");if(window.location.search.includes("code="))window.history.replaceState(null,"","/garden");});
    if(new URLSearchParams(window.location.search).has("error"))setError("Sign-in was cancelled or expired. Nothing was published.");
    void load();return ()=>{alive=false;subscription.unsubscribe();};
  },[load]);
  useEffect(()=>{if(user)void loadMine();else setMine([]);},[user,loadMine]);
  useEffect(()=>{if(!user){focusedOwner.current=null;return;}if(mine.length&&focusedOwner.current!==user.id){focusedOwner.current=user.id;focusEntry(mine[0]);}},[user,mine,focusEntry]);
  function openPanel(kind:"publish"|"account"){setPanel(kind);setConsent(false);setError("");setNotice("");setRemoveId(null);dialog.current?.showModal();}
  function closePanel(){if(busy)return;dialog.current?.close();setConsent(false);setRemoveId(null);}
  function keepPrivate(){if(busy)return;try{localStorage.removeItem(PENDING_KEY);setPending(null);setConsent(false);dialog.current?.close();setNotice("Kept private. Nothing was published, and your studio draft is still on this device.");}catch{setError("Couldn’t clear the pending copy from browser storage. Nothing has been published.");}}
  function changeAuthMode(mode:typeof authMode){setAuthMode(mode);setShowPassword(false);setPassword("");setConfirmPassword("");setError("");setNotice("");}
  async function authenticate(){
    const client=gardenClient();if(!client||busy)return;
    if((authMode==="signup"||authMode==="recovery")&&password!==confirmPassword){setError("The passwords don’t match.");return;}
    setBusy(true);setError("");setNotice("");
    try{
      const redirect=window.location.origin+"/garden/";
      if(authMode==="reset"){
        const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:redirect});if(error)throw error;
        setNotice("If an account exists for this email, you’ll receive a password reset link. Open it in this browser.");
      }else if(authMode==="recovery"){
        const {error}=await client.auth.updateUser({password});if(error)throw error;
        setAuthMode("signin");setNotice("Your password has been updated.");
      }else if(authMode==="signup"){
        const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:redirect}});if(error)throw error;
        setNotice(data.session ? "You’re signed in. Your flowers remain private until you publish." : "Check your email to confirm your account, then sign in. If you already have an account, use Sign in.");
      }else{
        const {error}=await client.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;
        setNotice("You’re signed in. Your flowers remain private until you publish.");
      }
      setPassword("");setConfirmPassword("");
    }catch(cause){
      const code=(cause as {code?:string}).code;
      setError(code==="invalid_credentials" ? "Email or password is incorrect. Try again or reset your password." : code==="email_not_confirmed" ? "Confirm your email before signing in. Check your inbox." : code==="weak_password" ? "Choose a stronger password with at least 8 characters." : code==="over_email_send_rate_limit"||code==="over_request_rate_limit" ? "Too many attempts. Please wait before trying again." : "We couldn’t complete this request. Please try again.");
    }finally{setBusy(false);}
  }
  async function publish(){const client=gardenClient();if(!client||busy||!user||!pending||!consent)return;setBusy(true);setError("");
    try{const {data:auth,error:authError}=await client.auth.getUser();if(authError||!auth.user)throw new Error("session");
      const {error}=await client.rpc("save_garden_entry",{p_title:title.trim(),p_nickname:name.trim(),p_design:publicSnapshot(pending,title),p_consent:consent});if(error)throw error;
      // Save success is authoritative; local storage failure must not invite duplicate publication.
      setPending(null);setConsent(false);try{localStorage.removeItem(PENDING_KEY);}catch{}dialog.current?.close();setNotice("Your Bathukamma is saved in the garden. Future changes update this same arrangement.");await load();await loadMine();
    }catch{setError("Your flowers weren’t published. Check your connection and sign-in, then try again. Each account has one arrangement in the garden.");}finally{setBusy(false);}}
  async function remove(){const client=gardenClient();if(!client||!user||!removeId)return;setBusy(true);setError("");try{const {data,error}=await client.from("garden_entries").delete().eq("id",removeId).eq("owner_id",user.id).select("id");if(error||!data?.length)throw error||new Error("missing");setEntries(old=>old.filter(e=>e.id!==removeId));setMine(old=>old.filter(e=>e.id!==removeId));setRemoveId(null);setNotice("Removed from the garden. Your studio draft is still on this device.");}catch{setError("We couldn’t remove that flower. Please try again.");}finally{setBusy(false);}}
  async function editOwn(entry:GardenEntry){
    setBusy(true);setError("");
    try{
      const client=gardenClient();if(!client)throw new Error("signin");
      const {data:auth,error:authError}=await client.auth.getUser();if(authError||!auth.user)throw new Error("signin");
      const {data,error}=await client.from("garden_entries").select(columns).eq("id",entry.id).eq("owner_id",auth.user.id).single();
      const owned=parseEntry(data);if(error||!owned)throw new Error("owner");
      sessionStorage.setItem(GARDEN_COPY_KEY,JSON.stringify(owned.design));router.push("/studio/?garden-copy=1");
    }catch{setError("Only your own published Bathukamma can be opened in the editor. Please check your sign-in.");}finally{setBusy(false);}
  }
  return <div className="garden-page garden-minimal"><div><SiteHeader active="garden">{user&&<button className="secondary-button" onClick={()=>openPanel("account")}>{tr("My flowers")}</button>}<button className="primary-button" onClick={()=>openPanel("publish")}><Icon name="flower" size={18}/>{tr(mine.length ? "Update mine" : "Add mine")}</button></SiteHeader>
    <main id="main-content" tabIndex={-1} aria-label={tr("Garden")}>
      <p className="garden-plain-status">{configured===false ? tr("Sample arrangements") : loading ? tr("Loading arrangements…") : ""}</p>
      <FestivalCanvas entries={entries} anchor={anchor} onNeighborhood={movedNeighborhood} mine={mine} focus={focus} onFocus={focusEntry}/>

      <div className="garden-notices" role="status" aria-live="polite">{tr(notice)}</div>{error&&!dialog.current?.open&&<p className="garden-error" role="alert">{tr(error)}</p>}
    </main></div>
    <dialog ref={dialog} className={`garden-dialog ${!user||authMode==="recovery" ? "garden-auth-dialog" : ""}`} aria-labelledby="garden-dialog-title" onCancel={e=>{if(busy)e.preventDefault();else setConsent(false);}}><div className="garden-dialog-inner"><button className="garden-close icon-button" aria-label={tr("Close garden dialog")} disabled={busy} onClick={closePanel}>×</button><div className="garden-dialog-brand"><Icon name="flower" size={28}/><p className="eyebrow">{tr("Garden")}</p></div><h2 id="garden-dialog-title">{!user||authMode==="recovery" ? tr(authMode==="signup" ? "Create your account" : authMode==="reset" ? "Reset your password" : authMode==="recovery" ? "Set a new password" : "Welcome back") : panel==="account"&&user ? tr("My Bathukamma") : panel==="publish" ? tr("Add to the garden") : tr("Sign in")}</h2>
      {configured===false ? <div className="garden-setup"><p>{tr("Sharing is not available yet.")}</p>{pending&&<div className="publish-preview"><ArrangementSvg design={pending} profile decorative/><span>{tr("Your design is ready for review. It hasn’t been published.")}</span></div>}<Link className="secondary-button" href="/studio">{tr("Keep arranging →")}</Link></div> : !authReady ? <p>{tr("Checking your sign-in…")}</p> : !user||authMode==="recovery" ? <div className="garden-auth"><p>{authMode==="recovery" ? tr("Choose a new password for your account.") : authMode==="reset" ? tr("We’ll email you a reset link.") : tr("Save your Bathukamma in the garden. Your draft stays private.")}</p>{(authMode==="signin"||authMode==="signup")&&<Tabs className="auth-mode-switch" value={authMode} onValueChange={value=>changeAuthMode(value as "signin"|"signup")}><TabsList aria-label={tr("Account access")}><TabsTrigger value="signin" disabled={busy}>{tr("Sign in")}</TabsTrigger><TabsTrigger value="signup" disabled={busy}>{tr("Create account")}</TabsTrigger></TabsList></Tabs>}<form onSubmit={e=>{e.preventDefault();void authenticate();}}>{authMode!=="recovery"&&<label>{tr("Email address")}<input type="email" placeholder="you@example.com" required autoComplete="email" maxLength={254} disabled={busy} value={email} onChange={e=>setEmail(e.target.value)}/></label>}{authMode!=="reset"&&<label>{authMode==="recovery" ? tr("New password") : tr("Password")}<span className="auth-password-field"><input type={showPassword ? "text" : "password"} aria-label={tr(authMode==="recovery" ? "New password" : "Password")} placeholder={tr("Enter your password")} required minLength={authMode==="signin" ? undefined : 8} maxLength={128} autoComplete={authMode==="signin" ? "current-password" : "new-password"} disabled={busy} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" className="auth-password-toggle" disabled={busy} aria-label={tr(showPassword ? "Hide password" : "Show password")} aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)}>{tr(showPassword ? "Hide" : "Show")}</button></span>{authMode!=="signin"&&<small>{tr("Use at least 8 characters.")}</small>}</label>}{(authMode==="signup"||authMode==="recovery")&&<label>{tr("Confirm password")}<input type={showPassword ? "text" : "password"} placeholder={tr("Repeat your password")} required minLength={8} maxLength={128} autoComplete="new-password" disabled={busy} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label>}<button className="primary-button" disabled={busy}>{busy ? tr("Please wait…") : authMode==="signup" ? tr("Create account") : authMode==="reset" ? tr("Send reset link") : authMode==="recovery" ? tr("Save new password") : tr("Sign in")}</button></form>{authMode==="signin"&&<button className="text-button" disabled={busy} onClick={()=>changeAuthMode("reset")}>{tr("Forgot password?")}</button>}{authMode==="reset"&&<button className="text-button" disabled={busy} onClick={()=>changeAuthMode("signin")}>{tr("Back to sign in")}</button>}</div> : panel==="account" ? <div className="garden-mine"><p>{tr("Your arrangement in the garden.")}</p>{mine.length ? mine.map(e=><div className="mine-item" key={e.id}><div className="mine-item-heading"><img className="mine-card-thumbnail" src={gardenThumbnail(e.design)} alt="" loading="lazy"/><div><strong>{e.title}</strong><span className="mine-card-meta">{e.design.layers.length} {tr("layers")} · {e.creator_name}</span></div></div><div className="mine-item-actions"><button className="secondary-button" disabled={busy} onClick={()=>{closePanel();focusEntry(e);}}>{tr("Find in garden")}<Icon name="arrow" size={15}/></button><button className="secondary-button" disabled={busy} onClick={()=>void editOwn(e)}>{tr("Edit mine")}</button><button className="text-button" disabled={busy} onClick={()=>setRemoveId(e.id)}>{tr("Remove from garden")}</button></div></div>) : <p>{tr("You haven’t published any flowers yet.")}</p>}{removeId&&<div className="garden-remove"><p>{tr("Remove this creation from the public garden? Your local draft will stay on your device.")}</p><button className="secondary-button" disabled={busy} onClick={()=>void remove()}>{tr("Yes, remove it")}</button><button className="text-button" disabled={busy} onClick={()=>setRemoveId(null)}>{tr("Keep it")}</button></div>}<button className="text-button" disabled={busy} onClick={async()=>{setBusy(true);const {error}=await gardenClient()!.auth.signOut({scope:"local"});if(error)setError("Couldn’t sign out. Please try again.");else{setNotice("Signed out of this browser.");setMine([]);}setBusy(false);}}>{tr("Sign out")}</button></div> : pending ? <div className="garden-publish"><p>{tr("One Bathukamma per account. Publishing again updates your existing arrangement.")}</p><div className="publish-preview"><ArrangementSvg design={pending} profile decorative/></div><form onSubmit={e=>{e.preventDefault();void publish();}}><label>{tr("Public title")}<input required maxLength={100} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>{tr("Public nickname")}<input required maxLength={40} placeholder={tr("Choose a nickname for this garden")} value={name} onChange={e=>setName(e.target.value)}/></label><label className="consent-label"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>{tr("I want this arrangement, title, and nickname to be public, including through the garden API.")}</label><p className="publication-note">{tr("Only this design, title and nickname are public. Your email and dedication stay private. Remove it from My flowers.")}</p><button className="primary-button" disabled={busy||!consent||!title.trim()||!name.trim()}>{busy ? tr("Publishing…") : tr(mine.length ? "Update my Bathukamma" : "Publish to garden")}</button></form></div> : <div className="garden-setup">{mine.length ? <><p>{tr("Your Bathukamma is already in the garden.")}</p><button className="primary-button" disabled={busy} onClick={()=>void editOwn(mine[0])}>{tr("Edit mine")}</button></> : <><p>{tr("Open your finished Bathukamma and choose Add mine.")}</p><Link className="primary-button" href="/studio">{tr("Make my Bathukamma →")}</Link></>}</div>}
      {pending&&<button className="text-button" disabled={busy} onClick={keepPrivate}>{tr("Keep this private")}</button>}
      {notice&&<p className="garden-dialog-status" role="status">{tr(notice)}</p>}{error&&<p className="garden-error" role="alert">{tr(error)}</p>}
    </div></dialog>
  </div>;
}
