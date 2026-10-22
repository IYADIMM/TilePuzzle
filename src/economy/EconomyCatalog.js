export const ECONOMY_VERSION=1;
export const DAILY_REWARDS=Object.freeze([
  {day:1,coins:75,gems:0},{day:2,coins:100,gems:0},{day:3,coins:125,gems:1},{day:4,coins:150,gems:0},{day:5,coins:200,gems:1},{day:6,coins:250,gems:0},{day:7,coins:400,gems:3}
]);
export const ECONOMY_CATALOG=Object.freeze([
  {id:'tile-jade',name:'Jade Tile Back',kind:'tile',currency:'coins',price:350},
  {id:'tray-lotus',name:'Lotus Tray Frame',kind:'tray',currency:'coins',price:500},
  {id:'celebration-petals',name:'Petal Celebration',kind:'celebration',currency:'gems',price:8},
  {id:'booster-hint-3',name:'3 Hint Boosters',kind:'booster',booster:'hint',quantity:3,currency:'coins',price:180},
  {id:'booster-undo-3',name:'3 Undo Boosters',kind:'booster',booster:'undo',quantity:3,currency:'coins',price:180},
  {id:'booster-shuffle-3',name:'3 Shuffle Boosters',kind:'booster',booster:'shuffle',quantity:3,currency:'gems',price:3}
]);
export function catalogItem(id){return ECONOMY_CATALOG.find(item=>item.id===id)||null;}
