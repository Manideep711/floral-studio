import { validateDesign, type Design } from "./schema";
export const DRAFT_KEY = "bathukamma:draft:v1";
export function parseDraft(raw:string):Design {
  const value:unknown = JSON.parse(raw);
  if(!validateDesign(value)) throw new Error("This draft uses an unsupported format or contains invalid values.");
  return value;
}
export function saveDraft(design:Design) { localStorage.setItem(DRAFT_KEY,JSON.stringify(design)); }
