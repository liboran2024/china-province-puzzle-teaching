'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Compass, Timer, Lightbulb, RotateCcw, MoveUpRight, Puzzle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import data from '@/lib/map-data.json';
import {freshGame,placePiece,formatTime} from '@/lib/game';
const ids=data.regions.map(r=>r.id);
const zooms=[{id:'810000',x:588,y:559},{id:'820000',x:667,y:559}];
type Drag={id:string;x:number;y:number;startX:number;startY:number;moving:boolean;width:number;height:number};
export default function Home(){
 const [selected,setSelected]=useState<string|null>(null);
 const [game,setGame]=useState(freshGame);const state=useRef(game);state.current=game;
 const [hint,setHint]=useState<string|null>(null);const [hot,setHot]=useState<string|null>(null);
 const [drag,setDrag]=useState<Drag|null>(null);const dragRef=useRef<Drag|null>(null);
 const [message,setMessage]=useState('');const [victory,setVictory]=useState(false);
 const board=useRef<SVGSVGElement>(null);const targets=useRef<Record<string,SVGPathElement|null>>({});
 const suppressClick=useRef(false);const hintTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const start=()=>setGame(g=>g.startedAt===null?{...g,startedAt:Date.now()}:g);
 useEffect(()=>{if(game.startedAt===null||game.won)return;const timer=setInterval(()=>setGame(g=>({...g,elapsed:Math.floor((Date.now()-g.startedAt!)/1000)})),1000);return()=>clearInterval(timer)},[game.startedAt,game.won]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(''),3200);return()=>clearTimeout(timer)},[message]);
 useEffect(()=>()=>{if(hintTimeout.current)clearTimeout(hintTimeout.current)},[]);
 const finish=useCallback((id:string,target:string)=>{
  const previous=state.current;const next=placePiece(previous,id,target,ids,Date.now());
  if(next===previous){if(!previous.placed.includes(id))setMessage('还没到家，再观察一下轮廓与方位');return false;}
  state.current=next;setGame(next);setSelected(null);setHint(null);setHot(null);
  setMessage(`${data.regions.find(r=>r.id===id)!.name}，归位成功！`);if(next.won)setVictory(true);return true;
 },[]);
 const reset=()=>{const next=freshGame();state.current=next;setGame(next);setSelected(null);setHint(null);setHot(null);setDrag(null);dragRef.current=null;setVictory(false);setMessage('新一轮探索开始，从熟悉的轮廓出发');if(hintTimeout.current)clearTimeout(hintTimeout.current)};
 const showHint=()=>{const id=selected??data.regions.find(r=>!state.current.placed.includes(r.id))?.id;if(!id)return;start();setSelected(id);setHint(id);setMessage(`寻找${data.regions.find(r=>r.id===id)!.name}：地图上的光亮就是提示`);if(hintTimeout.current)clearTimeout(hintTimeout.current);hintTimeout.current=setTimeout(()=>setHint(null),5000)};
 const targetAt=(id:string,cx:number,cy:number)=>{
  const svg=board.current;const matrix=svg?.getScreenCTM();if(!matrix)return false;
  const p=new DOMPoint(cx,cy).matrixTransform(matrix.inverse());
  if(p.x<0||p.x>900||p.y<0||p.y>650)return false;
  const zoom=zooms.find(z=>z.id===id);if(zoom&&p.x>=zoom.x&&p.x<=zoom.x+66&&p.y>=zoom.y&&p.y<=zoom.y+65)return true;
  const shape=targets.current[id];if(shape?.isPointInFill(p))return true;
  // A nearby small target may snap only when the pointer is not inside another province.
  if(Object.entries(targets.current).some(([key,node])=>key!==id&&node?.isPointInFill(p)))return false;
  const r=data.regions.find(r=>r.id===id)!;const [x,y,w,h]=r.box;
  return w<40&&h<40&&Math.hypot(p.x-(x+w/2),p.y-(y+h/2))<16;
 };
 const pointerDown=(e:ReactPointerEvent<HTMLButtonElement>,id:string)=>{if(e.button!==0||state.current.placed.includes(id))return;start();setSelected(id);suppressClick.current=false;e.currentTarget.setPointerCapture(e.pointerId);const r=data.regions.find(r=>r.id===id)!;const scale=board.current?.getScreenCTM()?.a??1;const factor=Math.max(scale,38/Math.max(r.box[2],r.box[3]));const next={id,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moving:false,width:(r.box[2]+6)*factor,height:(r.box[3]+6)*factor};dragRef.current=next;setDrag(next)};
 const pointerMove=(e:ReactPointerEvent<HTMLButtonElement>)=>{const d=dragRef.current;if(!d)return;const next={...d,x:e.clientX,y:e.clientY,moving:d.moving||Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>5};dragRef.current=next;setDrag(next);if(next.moving)setHot(targetAt(d.id,e.clientX,e.clientY)?d.id:null)};
 const pointerUp=(e:ReactPointerEvent<HTMLButtonElement>)=>{const d=dragRef.current;if(!d)return;if(d.moving){suppressClick.current=true;if(targetAt(d.id,e.clientX,e.clientY))finish(d.id,d.id);else setMessage('还没到家，再观察一下轮廓与方位')}dragRef.current=null;setDrag(null);setHot(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)};
 const cancelDrag=()=>{dragRef.current=null;setDrag(null);setHot(null)};
 const choose=(id:string)=>{if(suppressClick.current){suppressClick.current=false;return}start();setSelected(id);setMessage(`已选${data.regions.find(r=>r.id===id)!.short}，请点击或拖到对应轮廓`)};
 useEffect(()=>{const cancel=(e:KeyboardEvent)=>{if(e.key==='Escape'){cancelDrag();setSelected(null);setHint(null)}};window.addEventListener('keydown',cancel);window.addEventListener('blur',cancelDrag);return()=>{window.removeEventListener('keydown',cancel);window.removeEventListener('blur',cancelDrag)}},[]);
 const actions=useRef({finish,showHint,reset});actions.current={finish,showHint,reset};
 useEffect(()=>{
  type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean};execute:(input:unknown)=>unknown};
  const context=(document as Document&{modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;if(!context?.registerTool)return;
  const lifecycle=new AbortController();const register=(tool:Tool)=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}};
  register({name:'get_puzzle_progress',description:'读取中国政区拼图进度和剩余区域。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({completed:state.current.placed.length,remaining:data.regions.filter(r=>!state.current.placed.includes(r.id)).map(r=>({id:r.id,name:r.name})),won:state.current.won})});
  register({name:'place_province_piece',description:'将指定行政区碎片放到指定目标；只有二者一致才归位。',inputSchema:{type:'object',properties:{pieceId:{type:'string'},targetId:{type:'string'}},required:['pieceId','targetId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input)=>{const v=input as {pieceId?:string;targetId?:string};if(!v||!ids.includes(v.pieceId??'')||!ids.includes(v.targetId??''))throw Error('行政区编号无效');const placed=actions.current.finish(v.pieceId!,v.targetId!);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return {placed,completed:state.current.placed.length,won:state.current.won}}});
  return()=>lifecycle.abort();
 },[]);
 const ghostRegion=drag?data.regions.find(r=>r.id===drag.id):null;
 return <main className="game-shell">
  <header className="topbar"><div className="brand"><Compass size={30}/><span>地理探索室<small>GEOGRAPHY LAB</small></span></div><span className="lesson-tag">中国地理 · 互动课堂</span><button className="quiet-button" onClick={reset}><RotateCcw size={17}/>重新开始</button></header>
  <section className="heading"><div><div className="eyebrow">一块一省，拼出山河</div><h1>拼出<span>中国</span><i>CHINA PUZZLE</i></h1><p>观察轮廓，把右侧拼图拖到地图上，让每一块山河归位。</p></div><div className="scoreboard"><div><strong>{String(game.placed.length).padStart(2,'0')}<span> / 34</span></strong><small>已归位</small></div><div><strong><Timer size={21}/>{formatTime(game.elapsed)}</strong><small>探索用时</small></div></div></section>
  <div className="workspace"><section className="map-panel"><div className="panel-top"><span><span className="live-dot"/>中国政区图</span><span className="panel-meta">34 个省级行政区</span></div><div className="map-wrap"><svg ref={board} viewBox="0 0 900 650" className="china-map" aria-label="中国34个省级行政区拼图底板"><defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#284250"/></pattern></defs><rect width="900" height="650" fill="url(#grid)"/>
  {data.regions.map(r=><path key={r.id} ref={el=>{targets.current[r.id]=el}} d={r.d} role="button" tabIndex={game.placed.includes(r.id)?-1:0} aria-label={`${r.name}${game.placed.includes(r.id)?'，已归位':'目标轮廓'}`} onClick={()=>{if(selected)finish(selected,r.id)}} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&selected){e.preventDefault();finish(selected,r.id)}}} style={game.placed.includes(r.id)?{fill:r.color}:undefined} className={`province ${game.placed.includes(r.id)?'placed':''} ${hint===r.id||hot===r.id?'hinted':''}`}><title>{r.name}</title></path>)}<path d={data.boundary} className="boundary"/>
  {data.regions.filter(r=>game.placed.includes(r.id)&&!zooms.some(z=>z.id===r.id)).map(r=><text key={'label'+r.id} x={r.center[0]} y={r.center[1]} textAnchor="middle" dominantBaseline="central" className="placed-label">{r.short}</text>)}
  {zooms.map(z=>{const r=data.regions.find(r=>r.id===z.id)!;return <g key={z.id}><path d={`M${r.center[0]},${r.center[1]} L${z.x+33},${z.y}`} stroke="#7895a6" strokeWidth=".8" strokeDasharray="3 3" fill="none" pointerEvents="none"/><g transform={`translate(${z.x} ${z.y})`} role="button" tabIndex={game.placed.includes(z.id)?-1:0} aria-label={`${r.name}放大定位区`} onClick={()=>{if(selected)finish(selected,z.id)}} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&selected){e.preventDefault();finish(selected,z.id)}}}><rect width="66" height="65" rx="7" className={`target-zoom ${hint===z.id||hot===z.id?'hinted':''}`}/><svg x="8" y="5" width="50" height="35" viewBox={`${r.box[0]-1} ${r.box[1]-1} ${r.box[2]+2} ${r.box[3]+2}`}><path d={r.d} fill={game.placed.includes(z.id)?r.color:'#577385'}/></svg><text x="33" y="55" textAnchor="middle" className="zoom-caption">{r.short}</text></g></g>})}
  <g transform="translate(754 365)" aria-label="南海诸岛附图"><rect width="128" height="265" rx="8" className="inset-bg"/><text x="64" y="24" textAnchor="middle" className="map-caption">南海诸岛</text><g transform="translate(8 35)"><path d={data.sea} className="sea-path"/></g></g><g transform="translate(45 570)"><path d="M0 30V0L-5 12M0 0L5 12" stroke="#8ea7b6" fill="none"/><text x="-5" y="-12" className="map-caption">N</text></g><text x="624" y="545" className="zoom-caption">港澳放大定位</text></svg>{message&&<div className="map-status" role="status">{message}</div>}</div><div className="map-footer"><span><MoveUpRight size={16}/>拖动碎片 · 靠近归位 · 自动吸附</span><button className="hint-button" onClick={showHint} disabled={game.won}><Lightbulb size={17}/>给我一点提示</button></div></section>
  <aside className="piece-panel"><div className="piece-heading"><div><h2><Puzzle size={20}/>待拼区域</h2><p>从你最熟悉的轮廓开始</p></div><span className="count-pill">{34-game.placed.length}</span></div><Progress value={game.placed.length/34*100} aria-label="拼图完成进度"/><div className="piece-grid">{[...data.regions.filter(r=>!game.placed.includes(r.id)),...data.regions.filter(r=>game.placed.includes(r.id))].map(r=><button key={r.id} disabled={game.placed.includes(r.id)} aria-label={`${r.name}拼图碎片${game.placed.includes(r.id)?'，已归位':''}`} aria-pressed={selected===r.id} onPointerDown={e=>pointerDown(e,r.id)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={cancelDrag} onClick={()=>choose(r.id)} className={`piece-card ${selected===r.id?'selected':''} ${game.placed.includes(r.id)?'done':''}`} style={{'--piece-color':r.color} as React.CSSProperties}><svg viewBox={`${r.box[0]-3} ${r.box[1]-3} ${r.box[2]+6} ${r.box[3]+6}`} aria-hidden="true"><path d={r.d}/></svg><span>{game.placed.includes(r.id)?'✓ ':''}{r.short}</span></button>)}</div><div className="tray-note">也可点选碎片，再点击目标。键盘使用 Tab / Enter。</div></aside></div>
  <footer className="page-footer"><span>23 省 · 5 自治区 · 4 直辖市 · 2 特别行政区</span><span><a href="https://datav.aliyun.com/portal/school/atlas/area_selector" target="_blank" rel="noreferrer">地图数据：DataV.GeoAtlas</a> · 教学互动示意</span></footer>
  {drag?.moving&&ghostRegion&&<svg className="ghost" style={{left:drag.x-drag.width/2,top:drag.y-drag.height/2,width:drag.width,height:drag.height}} viewBox={`${ghostRegion.box[0]-3} ${ghostRegion.box[1]-3} ${ghostRegion.box[2]+6} ${ghostRegion.box[3]+6}`}><path d={ghostRegion.d} fill={ghostRegion.color} stroke="#e7fff2" strokeWidth="1.2"/></svg>}
  {victory&&<div className="confetti" aria-hidden="true">{Array.from({length:42},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,background:data.regions[i%34].color,animationDelay:`${i%7*.11}s`,rotate:`${i*19}deg`}}/>)}</div>}
  <Dialog open={victory} onOpenChange={setVictory}><DialogContent className="victory" showCloseButton={false}><div className="victory-icon">✦</div><DialogTitle>山河归位，挑战成功！</DialogTitle><DialogDescription>34 个省级行政区，全部拼合完成。<br/>本次探索用时 {formatTime(game.elapsed)}<br/>再看看，你记住了哪些相邻的省区？</DialogDescription><button className="primary-button" onClick={reset}>再探索一次</button><button className="quiet-button" style={{justifyContent:'center'}} onClick={()=>setVictory(false)}>欣赏完整地图</button></DialogContent></Dialog>
 </main>
}
