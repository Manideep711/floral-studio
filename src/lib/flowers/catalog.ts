export type FlowerId = "tangedu" | "gunugu" | "banti" | "rose";
export type Flower = { id: FlowerId; name: string; telugu: string; botanical: string; description: string; colors: { name: string; hex: string; creative?: boolean }[] };
export const flowers: Flower[] = [
  { id: "tangedu", name: "Tangedu", telugu: "తంగేడు", botanical: "Senna auriculata", description: "Five yellow petals with curved stamens.", colors: [{name:"Sun yellow",hex:"#F2C643"},{name:"Golden yellow",hex:"#EFB32B"},{name:"Pale yellow",hex:"#F8DC77"}] },
  { id: "gunugu", name: "Gunugu", telugu: "గునుగు", botanical: "Celosia argentea · spike form", description: "A tapered flower spike.", colors: [{name:"Soft ivory",hex:"#EEE4D7"},{name:"Natural pink",hex:"#DCA7BA"},{name:"Decorative pink",hex:"#C8587A",creative:true},{name:"Decorative plum",hex:"#973E68",creative:true}] },
  { id: "banti", name: "Banti", telugu: "బంతి", botanical: "Tagetes erecta · selected marigold form", description: "Round marigolds with ruffled petals.", colors: [{name:"Marigold orange",hex:"#E98333"},{name:"Amber",hex:"#F3AA36"},{name:"Golden yellow",hex:"#F3CE49"}] }
  ,{id:"rose",name:"Rose",telugu:"గులాబీ",botanical:"Rosa · double garden rose",description:"Layered petals around a curled centre.",colors:[{name:"Crimson rose",hex:"#C64A64"},{name:"Blush rose",hex:"#EAA9B7"},{name:"Ivory rose",hex:"#F5EADC"}]}
];
export const flowerById = (id: FlowerId) => flowers.find(f => f.id === id)!;
