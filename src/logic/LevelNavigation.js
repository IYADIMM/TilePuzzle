export const LEVELS_PER_PAGE=6;
export function levelPageFor(level,total=1000){return Math.max(0,Math.min(Math.ceil(total/LEVELS_PER_PAGE)-1,Math.floor((Math.max(1,Number(level)||1)-1)/LEVELS_PER_PAGE)));}
export function levelsForPage(levels,page){const last=Math.max(0,Math.ceil(levels.length/LEVELS_PER_PAGE)-1),safe=Math.max(0,Math.min(last,Number(page)||0)),start=safe*LEVELS_PER_PAGE;return{page:safe,pageCount:last+1,start,levels:levels.slice(start,start+LEVELS_PER_PAGE)};}
