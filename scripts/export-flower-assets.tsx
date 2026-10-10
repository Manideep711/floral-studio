import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {mkdirSync,writeFileSync} from "node:fs";
import FlowerArt from "../src/components/flowers/FlowerArt";
import {flowers} from "../src/lib/flowers/catalog";
mkdirSync("public/flowers",{recursive:true});
for(const f of flowers) {
  const markup=renderToStaticMarkup(<FlowerArt kind={f.id} color={f.colors[0].hex} size={160}/>).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
  writeFileSync(`public/flowers/${f.id}.svg`,markup);
}
