export function checkDeploymentEnvironment(env:Record<string,string|undefined>):"sample"|"live" {
 const url=env.NEXT_PUBLIC_SUPABASE_URL?.trim(),key=env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
 if(!url&&!key){if(env.REQUIRE_LIVE_GARDEN==="1")throw new Error("Live garden requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");return "sample";}
 if(!url||!key)throw new Error("Set both Supabase public environment variables, or leave both unset for sample mode.");
 let parsed:URL;try{parsed=new URL(url);}catch{throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid project URL.");}
 if(parsed.protocol!=="https:"&&!(parsed.protocol==="http:"&&["localhost","127.0.0.1","[::1]"].includes(parsed.hostname)))throw new Error("Use an HTTPS Supabase URL (HTTP is allowed only on loopback for local development).");
 if(parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error("Supabase URL must not contain credentials, query parameters, or fragments.");
 if(key.startsWith("sb_secret_"))throw new Error("A secret Supabase key cannot be included in the browser build. Use a publishable key.");
 if(/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))return "live";
 try{const payload=JSON.parse(atob(key.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));if(payload.role==="anon")return "live";}catch{}
 throw new Error("Use the browser-safe Supabase publishable key or legacy anon key; never a service-role key.");
}
