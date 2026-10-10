import {renderToStaticMarkup} from "react-dom/server";
import {writeFileSync} from "node:fs";
import {FlowerShape} from "../src/components/flowers/FlowerArt";
import {flowers} from "../src/lib/flowers/catalog";
const markup:Record<string,string>={};
for(const flower of flowers)for(const color of flower.colors)markup[`${flower.id}:${color.hex}`]=renderToStaticMarkup(<FlowerShape kind={flower.id} color={color.hex}/>);
writeFileSync("src/lib/garden/flower-markup.json",JSON.stringify(markup));
