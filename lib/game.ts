export const TOTAL = 34;
export type GameState={placed:string[];startedAt:number|null;elapsed:number;won:boolean};
export const freshGame=():GameState=>({placed:[],startedAt:null,elapsed:0,won:false});
export function placePiece(state:GameState,id:string,targetId:string,validIds:readonly string[],now:number):GameState{
 if(id!==targetId||!validIds.includes(id)||state.placed.includes(id)||state.won)return state;
 const placed=[...state.placed,id];const startedAt=state.startedAt??now;
 return {placed,startedAt,elapsed:Math.max(0,Math.floor((now-startedAt)/1000)),won:placed.length===TOTAL};
}
export const formatTime=(seconds:number)=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
