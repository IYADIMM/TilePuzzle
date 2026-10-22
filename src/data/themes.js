export const MATERIALS=Object.freeze({
  mahogany:{id:'mahogany',name:'Polished Mahogany',base:'#713316',dark:'#260b05',light:'#c87331',accent:'#f0aa52',pattern:'mahogany'},
  naturalWood:{id:'naturalWood',name:'Natural Maple Wood',base:'#b97837',dark:'#5b2e13',light:'#e6b768',accent:'#ffe0a0',pattern:'naturalWood'},
  chrome:{id:'chrome',name:'Mirror Chrome',base:'#aebbc5',dark:'#3f4a54',light:'#fbffff',accent:'#8fe0ff',pattern:'chrome'},
  brushedSteel:{id:'brushedSteel',name:'Brushed Steel',base:'#858f98',dark:'#333b42',light:'#dce4e9',accent:'#b6c3cc',pattern:'brushedSteel'},
  clearGlass:{id:'clearGlass',name:'Clear Ocean Glass',base:'#5bbfbb',dark:'#1d6263',light:'#dcfff9',accent:'#8af4e7',pattern:'clearGlass'},
  frostedGlass:{id:'frostedGlass',name:'Frosted Pearl Glass',base:'#c5a4c9',dark:'#62506c',light:'#fff1ff',accent:'#bdefff',pattern:'frostedGlass'},
  ceramic:{id:'ceramic',name:'Glazed Ceramic',base:'#70aeba',dark:'#285b67',light:'#e7fcff',accent:'#ffffff',pattern:'ceramic'},
  leather:{id:'leather',name:'Hand-Stitched Leather',base:'#914c29',dark:'#3a1b0f',light:'#d78b52',accent:'#f4c484',pattern:'leather'},
  fabric:{id:'fabric',name:'Quilted Velvet Fabric',base:'#82405f',dark:'#331625',light:'#c87ca0',accent:'#f3bad2',pattern:'fabric'},
  fur:{id:'fur',name:'Soft Safari Fur',base:'#b98d5f',dark:'#604126',light:'#efd3ab',accent:'#fff0d2',pattern:'fur'},
  stone:{id:'stone',name:'Polished Garden Stone',base:'#7f8279',dark:'#353832',light:'#c9cbbf',accent:'#e4d7ad',pattern:'stone'},
  decorativeMetal:{id:'decorativeMetal',name:'Iridescent Decorative Metal',base:'#6974a9',dark:'#282d58',light:'#d8ddff',accent:'#efa1e9',pattern:'decorativeMetal'}
});

export const THEMES=Object.freeze([
  theme('fruits','Fruit Garden','mahogany',['cherries','orange','strawberry','pineapple','watermelon','grapes'],['#cf183d','#f79418'],'orchard'),
  theme('cars','Dream Garage','chrome',['sports-car','vintage-car','suv','race-car','taxi','convertible'],['#3485d6','#e23e38'],'road'),
  theme('sports','Champions Club','leather',['soccer','basketball','tennis','baseball','football','trophy'],['#ec8a21','#2b9754'],'stadium'),
  theme('auto-parts','Master Garage','brushedSteel',['gear','spark-plug','tire','piston','steering-wheel','brake-disc'],['#7c8790','#dc4a3c'],'workshop'),
  theme('wild-animals','Wild Safari','fur',['lion','elephant','zebra','giraffe','tiger','panda'],['#dc9a31','#548f43'],'savanna'),
  theme('pets','Cozy Companions','fabric',['puppy','kitten','rabbit','hamster','parrot','goldfish'],['#ce6b98','#55a9cc'],'cozy'),
  theme('desserts','Sweet Patisserie','ceramic',['cupcake','donut','ice-cream','macaron','cake','cookie'],['#ed81a9','#68bbcf'],'patisserie'),
  theme('flowers','Blooming Garden','frostedGlass',['blossom','sunflower','tulip','rose','daisy','lavender'],['#e069a3','#efb837'],'garden'),
  theme('ocean-life','Coral Cove','clearGlass',['dolphin','turtle','seahorse','starfish','octopus','tropical-fish'],['#31b5bd','#467ddb'],'ocean'),
  theme('music','Music Lounge','naturalWood',['guitar','piano','drum','saxophone','headphones','microphone'],['#b96831','#d8a426'],'lounge'),
  theme('travel','World Journey','stone',['airplane','suitcase','camera','compass','passport','globe'],['#4798bd','#c57535'],'journey'),
  theme('space','Cosmic Voyage','decorativeMetal',['rocket','planet','moon','astronaut','comet','satellite'],['#6e67cf','#d85ec4'],'cosmos')
]);
function theme(id,name,materialId,iconIds,palette,rewardId){return Object.freeze({id,name,materialId,iconIds:Object.freeze(iconIds),palette:Object.freeze(palette),rewardId});}
export function getThemeForLevel(level){return THEMES[(Math.max(1,level)-1)%THEMES.length];}
export function getTheme(themeId){return THEMES.find(theme=>theme.id===themeId)||THEMES[0];}
export function getMaterial(materialId){return MATERIALS[materialId]||MATERIALS.mahogany;}
export function iconTextureKey(iconId){return`icon:${iconId}`;}
export const ICON_COUNT=THEMES.reduce((sum,theme)=>sum+theme.iconIds.length,0);
