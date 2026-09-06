import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync('../china-source.json','utf8'));
const project=([x,y])=>[(x-73)*12.5+28,(54-y)*15+28];
const polys=f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
const path=(ps,proj)=>ps.map(p=>p.map(r=>r.map((pt,i)=>`${i?'L':'M'}${proj(pt).map(n=>n.toFixed(2)).join(',')}`).join('')+'Z').join('')).join('');
const regions=source.features.filter(f=>f.properties.name).map((f,i)=>{
 const ps=polys(f).filter(p=>p[0].some(pt=>pt[1]>17.5));
 const points=ps.flat(2).map(project); const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const box=[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];
 return {id:String(f.properties.adcode),name:f.properties.name,short:f.properties.name.replace(/维吾尔自治区|壮族自治区|回族自治区|特别行政区|自治区|省|市/g,''),d:path(ps,project),box,center:project(f.properties.centroid||f.properties.center),color:['#68d6bc','#78b5ed','#b7a0ef','#f3ca75','#f29c8c','#9dd47c'][i%6]};
});
const sea=source.features.flatMap(f=>polys(f)).filter(p=>p[0].every(([x,y])=>x>105&&y<25));
const jd=source.features.find(f=>f.properties.adcode==='100000_JD');
const output={regions,sea:path(sea,([x,y])=>[(x-105)*5.5,(25-y)*10]),boundary:path(polys(jd).filter(p=>p[0].some(pt=>pt[1]>17.5)),project)};
if(regions.length!==34||new Set(regions.map(r=>r.id)).size!==34)throw Error('需要34个行政区');
fs.writeFileSync('lib/map-data.json',JSON.stringify(output));
fs.copyFileSync('../china-source.json','public/china-source.json');
console.log('34个行政区已生成，南海附图路径：',output.sea.length);
