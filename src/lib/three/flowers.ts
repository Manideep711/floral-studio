import * as THREE from "three";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type {FlowerId} from "../flowers/catalog";

function colored(g:THREE.BufferGeometry,color:THREE.ColorRepresentation,petalDetail=false) {
  const geometry=g.index ? g.toNonIndexed() : g;
  if(geometry!==g) g.dispose();
  geometry.deleteAttribute("uv");
  const c=new THREE.Color(color),values=new Float32Array(geometry.attributes.position.count*3);
  geometry.computeBoundingBox();
  const bottom=geometry.boundingBox!.min.y,span=Math.max(.001,geometry.boundingBox!.max.y-bottom);
  for(let i=0;i<values.length;i+=3){
    const vertex=i/3,p=geometry.attributes.position,n=geometry.attributes.normal;
    // Pigment and creases live in vertex colours, including on low-power phones.
    // No per-flower textures, shader effects or extra draw calls are needed.
    const vein=Math.sin(p.getX(vertex)*420+p.getZ(vertex)*180)*.035;
    const shade=petalDetail ? .64+.24*(p.getY(vertex)-bottom)/span+.13*Math.abs(n.getY(vertex))+vein : 1;
    values[i]=c.r*shade;values[i+1]=c.g*shade;values[i+2]=c.b*shade;
  }
  geometry.setAttribute("color",new THREE.BufferAttribute(values,3));return geometry;
}
// Rounded, cupped petal surfaces. Smooth normals are computed before merging.
function petal(angle:number,length:number,width:number,lift:number,baseY=0,baseRadius=.018,ruffled=false,crossSegments=4,radialSegments=4) {
  const positions:number[]=[],indices:number[]=[];
  for(let row=0;row<=radialSegments;row++) for(let col=0;col<=crossSegments;col++) {
    const t=row/radialSegments,u=col/crossSegments*2-1;
    const breadth=Math.pow(Math.sin(Math.PI*t),.6)*(1+.045*Math.sin(t*18+angle));
    const r=baseRadius+t*length-(ruffled ? Math.abs(u)*.008*t : 0);
    const w=breadth*width*u;
    const y=baseY+Math.sin(t*Math.PI)*lift+u*u*.009+Math.sin(t*9+angle)*Math.abs(u)*.003+(ruffled ? Math.sin(t*10+u*7+angle)*.007 : 0);
    positions.push(Math.sin(angle)*r+Math.cos(angle)*w,y,Math.cos(angle)*r-Math.sin(angle)*w);
  }
  const stride=crossSegments+1;
  for(let r=0;r<radialSegments;r++) for(let c=0;c<crossSegments;c++){const a=r*stride+c;indices.push(a,a+stride,a+1,a+1,a+stride,a+stride+1);}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function marigoldPetal(angle:number,radius:number,height:number,variation:number) {
  const positions:number[]=[],indices:number[]=[];
  for(let row=0;row<=3;row++) for(let col=0;col<=2;col++) {
    const t=row/3,u=col-1;
    const r=radius-.034+t*.061+Math.cos(u*6+variation)*.004*t;
    const w=(.011+Math.sin(t*Math.PI)*.013)*u;
    const y=height+(1-t)*.025+Math.sin(t*Math.PI)*.018+u*u*.009+Math.sin(t*9+u*4+variation)*.005;
    positions.push(Math.sin(angle)*r+Math.cos(angle)*w,y,Math.cos(angle)*r-Math.sin(angle)*w);
  }
  for(let row=0;row<3;row++) for(let col=0;col<2;col++){const a=row*3+col;indices.push(a,a+3,a+1,a+1,a+3,a+4);}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function makeFlowerGeometry(kind:FlowerId,light=false):THREE.BufferGeometry {
  const parts:THREE.BufferGeometry[]=[];
  if(kind==="tangedu") {
    const lengths=[.118,.132,.105,.124,.113],widths=[.062,.057,.066,.061,.055];
    for(let i=0;i<5;i++) parts.push(colored(petal(i*Math.PI*2/5+.085*Math.sin(i*3),lengths[i],widths[i],.019+i%3*.004,.007,.008,false,light?4:5,light?4:6),i%2 ? "#FFF0C6" : "#FFFFFF",true));
    const throat=new THREE.SphereGeometry(.048,light?8:12,5);throat.scale(1,.24,1);throat.translate(0,.014,0);parts.push(colored(throat,"#EED391",true));
    const center=new THREE.SphereGeometry(.012,8,5);center.scale(1,.55,1);center.translate(0,.026,0);parts.push(colored(center,"#BB994C"));
    // Three prominent lower stamens, four shorter ones and three reduced upper
    // stamens (Kew, Flora of Tropical East Africa). Gentle arcs, not upright rods.
    for(let i=0;i<7;i++){
      const large=i<3,x=large ? (i-1)*.009 : (i-4.5)*.006,z=large ? .029 : -.012;
      const end=new THREE.Vector3(x,large ? .032 : .027,z);
      const filament=new THREE.CubicBezierCurve3(new THREE.Vector3(x*.3,.02,0),new THREE.Vector3(x*.6,.027,z*.2),new THREE.Vector3(x,.035,z*.7),end);
      parts.push(colored(new THREE.TubeGeometry(filament,3,large ? .0018 : .0012,3,false),"#D2B673"));
      if(large){const anther=new THREE.QuadraticBezierCurve3(end,new THREE.Vector3(x+.005,.036,z+.007),new THREE.Vector3(x+.007,.03,z+.014));parts.push(colored(new THREE.TubeGeometry(anther,5,.0026,3,false),"#987432"));}
      else{const tip=new THREE.SphereGeometry(.0025,4,3);tip.scale(.7,1,1.5);tip.translate(end.x,end.y,end.z);parts.push(colored(tip,"#AC8B44"));}
    }
    for(let i=0;i<3;i++){const tip=new THREE.SphereGeometry(.002,4,3);tip.scale(.8,1,1.4);tip.translate((i-1)*.006,.022,-.022);parts.push(colored(tip,"#C7A653"));}
  } else if(kind==="rose") {
    const core=new THREE.SphereGeometry(.104,light?8:12,6);core.scale(1,.5,1);core.translate(0,.04,0);parts.push(colored(core,"#CBA6B0",true));
    const counts=light?[7,6,5,4,3]:[9,8,7,5,3],radii=[.088,.069,.049,.029,.01];
    for(let ring=0;ring<counts.length;ring++)for(let i=0;i<counts[ring];i++){
      const a=i/counts[ring]*Math.PI*2+ring*.55;
      parts.push(colored(petal(a,.057-ring*.007,.041-ring*.006,.027,.022+ring*.017,radii[ring],false,light?2:4,light?3:4),i%3===0 ? "#F4D8DD" : "#FFFFFF",true));
    }
  } else if(kind==="banti") {
    const core=new THREE.SphereGeometry(.112,light?8:12,light?6:8);core.scale(1,.82,1);core.translate(0,.066,0);parts.push(colored(core,"#D8A852"));
    const rings=light?[14,11,8,5,3]:[19,16,12,8,5];
    const radii=[.106,.086,.062,.037,.014];
    for(let ring=0;ring<rings.length;ring++) for(let i=0;i<rings[ring];i++) {
      const a=i/rings[ring]*Math.PI*2+ring*.39,variation=i*1.7+ring*3;
      const height=.035+Math.sqrt(Math.max(0,.112*.112-radii[ring]*radii[ring]))*.96;
      parts.push(colored(marigoldPetal(a,radii[ring],height,variation),i%4===0 ? "#DDBB7E" : i%3===0 ? "#FFF0C9" : "#FFFFFF",true));
    }
  } else {
    const points=[new THREE.Vector2(0,0),new THREE.Vector2(.048,.01),new THREE.Vector2(.059,.045),new THREE.Vector2(.051,.09),new THREE.Vector2(.035,.14),new THREE.Vector2(.009,.19),new THREE.Vector2(0,.2)];
    parts.push(colored(new THREE.LatheGeometry(points,light?8:12),"#D9C2CC"));
    for(let row=0;row<8;row++) for(let side=0;side<(light?5:7);side++) {
      const a=side*Math.PI*2/(light?5:7)+row*.43;
      const g=petal(a,.024,.014,.012,row*.022+.014,.012+(7-row)*.006,false,2,2);
      parts.push(colored(g,(row+side)%4===0 ? "#D2AABA" : (row+side)%3===0 ? "#FFF1DF" : "#F4DFE6",true));
    }
    for(const g of parts) g.rotateX(-Math.PI/12);
  }
  const merged=mergeGeometries(parts,false)!;parts.forEach(g=>g.dispose());merged.computeBoundingSphere();return merged;
}



// Distant garden flowers keep recognizable petals with a small shared mesh.
// All canonical heads are instanced; only nearby batches use the detailed mesh.
export function makeGardenFlowerGeometry(kind:FlowerId):THREE.BufferGeometry {
 const parts:THREE.BufferGeometry[]=[];
 if(kind==="tangedu"){
  for(let i=0;i<5;i++)parts.push(colored(petal(i*Math.PI*2/5,.12,.06,.018,.007,.008,false,2,3),i%2 ? "#FFF0C6" : "#FFFFFF",true));
  const center=new THREE.IcosahedronGeometry(.025,0);center.scale(1,.3,1);center.translate(0,.02,0);parts.push(colored(center,"#BC9B45"));
 }else if(kind==="banti"){
  const core=new THREE.IcosahedronGeometry(.09,0);core.scale(1,.7,1);core.translate(0,.025,0);parts.push(colored(core,"#DFC49B",true));
  for(let ring=0;ring<2;ring++)for(let i=0;i<6-ring;i++)parts.push(colored(petal(i*Math.PI*2/(6-ring)+ring*.7,.065-ring*.012,.035,.025,.01+ring*.025,.045-ring*.015,true,2,2),"#FFFFFF",true));
 }else if(kind==="gunugu"){
  for(let ring=0;ring<3;ring++){const g=new THREE.ConeGeometry(.063-ring*.017,.105,6);g.translate(0,.055+ring*.058,0);parts.push(colored(g,ring%2 ? "#FFF4EE" : "#E6C4D0",true));}
 }else{
  for(let ring=0;ring<2;ring++)for(let i=0;i<5-ring;i++)parts.push(colored(petal(i*Math.PI*2/(5-ring)+ring*.6,.08-ring*.022,.055,.028,.01+ring*.033,.017,false,2,2),ring ? "#E8C9D0" : "#FFFFFF",true));
 }
 const merged=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());merged.computeBoundingSphere();return merged;
}
