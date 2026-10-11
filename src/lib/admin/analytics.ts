import {gardenClient} from "../garden/client";
export function trackEvent(event:"page_view"|"card_download"|"card_share"){
 if(typeof window==="undefined"||location.hostname==="127.0.0.1"||location.hostname==="localhost"||navigator.doNotTrack==="1")return;
 void gardenClient()?.rpc("record_usage",{event_name:event,page_path:location.pathname==="/"?"/":location.pathname.replace(/\/$/,"")+"/"}).then(()=>{});
}
