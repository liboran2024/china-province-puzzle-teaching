import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshGame,placePiece,formatTime} from '../lib/game.ts';
const {regions,sea,boundary}=JSON.parse(fs.readFileSync('lib/map-data.json','utf8'));
const ids=regions.map(r=>r.id);
const expected=['110000','120000','130000','140000','150000','210000','220000','230000','310000','320000','330000','340000','350000','360000','370000','410000','420000','430000','440000','450000','460000','500000','510000','520000','530000','540000','610000','620000','630000','640000','650000','710000','810000','820000'];
assert.deepEqual([...ids].sort(),expected.sort());assert.ok(sea.startsWith('M')&&sea.endsWith('Z'));assert.equal(boundary.split('M').length-1,3);assert.ok(sea.split('M').length-1>100);
for(const r of regions){assert.ok(r.d.startsWith('M')&&r.d.endsWith('Z'));assert.ok(r.box.every(Number.isFinite));assert.ok(r.box[2]>0&&r.box[3]>0);assert.ok(r.box[0]>=0&&r.box[0]+r.box[2]<=900&&r.box[1]>=0&&r.box[1]+r.box[3]<=650,`${r.name}轮廓越界`)}
let game=freshGame();const empty=game;
assert.equal(placePiece(game,ids[0],ids[1],ids,1000),empty);
assert.equal(placePiece(game,'fake','fake',ids,1000),empty);
game=placePiece(game,ids[0],ids[0],ids,1000);assert.equal(game.placed.length,1);
assert.equal(placePiece(game,ids[0],ids[0],ids,2000),game);
for(let i=1;i<34;i++){game=placePiece(game,ids[i],ids[i],ids,1000+i*1000);assert.equal(game.won,i===33)}
assert.equal(game.placed.length,34);assert.equal(game.elapsed,33);assert.equal(formatTime(125),'02:05');
assert.deepEqual(freshGame(),{placed:[],startedAt:null,elapsed:0,won:false});
console.log('通过：34区名单、地图边界范围、南海数据、错放、无效区域、重复落位、完整通关、计时与重置。');
