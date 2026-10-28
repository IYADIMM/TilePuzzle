export const PREMIUM_TEXTURES=Object.freeze({
  tileBody:{key:'premium:tile-body',url:'/assets/premium/tile-body.webp'},
  tray:{key:'premium:tray-four-slot',url:'/assets/premium/tray-four-slot.webp'},
  button:{key:'premium:button-mahogany',url:'/assets/premium/button-mahogany.webp'}
});

// Measurements are expressed in the optimized runtime textures. Keeping these
// beside the manifest makes board, tray and QA use the same source of truth.
export const TILE_BODY_VISIBLE_BOUNDS=Object.freeze({
  textureWidth:512,textureHeight:640,left:19,top:13,right:492,bottom:626
});

export const TRAY_ASSET_GEOMETRY=Object.freeze({
  textureWidth:1024,textureHeight:400,
  visibleBounds:Object.freeze({left:8,top:8,right:1015,bottom:391}),
  slotInteriors:Object.freeze([
    Object.freeze({left:64,top:94,right:265,bottom:282}),
    Object.freeze({left:300,top:94,right:492,bottom:282}),
    Object.freeze({left:528,top:94,right:720,bottom:282}),
    Object.freeze({left:757,top:94,right:958,bottom:282})
  ]),
  safeInset:Object.freeze({x:10,y:12})
});

export const PREMIUM_ICONS=Object.freeze({
  cherries:'/assets/premium/fruit-cherries.webp',
  orange:'/assets/premium/fruit-orange.webp',
  strawberry:'/assets/premium/fruit-strawberry.webp',
  pineapple:'/assets/premium/fruit-pineapple.webp',
  watermelon:'/assets/premium/fruit-watermelon.webp',
  grapes:'/assets/premium/fruit-grapes.webp',
  'sports-car':'/assets/premium/car-sports.webp',
  'vintage-car':'/assets/premium/car-sedan.webp',
  suv:'/assets/premium/car-suv.webp',
  'race-car':'/assets/premium/car-race.webp',
  taxi:'/assets/premium/car-taxi.webp',
  convertible:'/assets/premium/car-convertible.webp',
  soccer:'/assets/premium/sports-soccer.webp',basketball:'/assets/premium/sports-basketball.webp',tennis:'/assets/premium/sports-tennis.webp',baseball:'/assets/premium/sports-baseball.webp',football:'/assets/premium/sports-football.webp',trophy:'/assets/premium/sports-trophy.webp',
  gear:'/assets/premium/auto-gear.webp','spark-plug':'/assets/premium/auto-spark-plug.webp',tire:'/assets/premium/auto-tire.webp',piston:'/assets/premium/auto-piston.webp','steering-wheel':'/assets/premium/auto-steering-wheel.webp','brake-disc':'/assets/premium/auto-brake-disc.webp',
  lion:'/assets/premium/wild-lion.webp',elephant:'/assets/premium/wild-elephant.webp',zebra:'/assets/premium/wild-zebra.webp',giraffe:'/assets/premium/wild-giraffe.webp',tiger:'/assets/premium/wild-tiger.webp',panda:'/assets/premium/wild-panda.webp',
  puppy:'/assets/premium/pet-puppy.webp',kitten:'/assets/premium/pet-kitten.webp',rabbit:'/assets/premium/pet-rabbit.webp',hamster:'/assets/premium/pet-hamster.webp',parrot:'/assets/premium/pet-parrot.webp',goldfish:'/assets/premium/pet-goldfish.webp',
  cupcake:'/assets/premium/dessert-cupcake.webp',donut:'/assets/premium/dessert-donut.webp','ice-cream':'/assets/premium/dessert-ice-cream.webp',macaron:'/assets/premium/dessert-macaron.webp',cake:'/assets/premium/dessert-cake.webp',cookie:'/assets/premium/dessert-cookie.webp',
  blossom:'/assets/premium/flower-blossom.webp',sunflower:'/assets/premium/flower-sunflower.webp',tulip:'/assets/premium/flower-tulip.webp',rose:'/assets/premium/flower-rose.webp',daisy:'/assets/premium/flower-daisy.webp',lavender:'/assets/premium/flower-lavender.webp',
  dolphin:'/assets/premium/ocean-dolphin.webp',turtle:'/assets/premium/ocean-turtle.webp',seahorse:'/assets/premium/ocean-seahorse.webp',starfish:'/assets/premium/ocean-starfish.webp',octopus:'/assets/premium/ocean-octopus.webp','tropical-fish':'/assets/premium/ocean-tropical-fish.webp',
  guitar:'/assets/premium/music-guitar.webp',piano:'/assets/premium/music-piano.webp',drum:'/assets/premium/music-drum.webp',saxophone:'/assets/premium/music-saxophone.webp',headphones:'/assets/premium/music-headphones.webp',microphone:'/assets/premium/music-microphone.webp',
  airplane:'/assets/premium/travel-airplane.webp',suitcase:'/assets/premium/travel-suitcase.webp',camera:'/assets/premium/travel-camera.webp',compass:'/assets/premium/travel-compass.webp',passport:'/assets/premium/travel-passport.webp',globe:'/assets/premium/travel-globe.webp',
  rocket:'/assets/premium/space-rocket.webp',planet:'/assets/premium/space-planet.webp',moon:'/assets/premium/space-moon.webp',astronaut:'/assets/premium/space-astronaut.webp',comet:'/assets/premium/space-comet.webp',satellite:'/assets/premium/space-satellite.webp',
  'garden-lotus':'/assets/premium/ivory-garden/garden-lotus.webp',
  'garden-bamboo':'/assets/premium/ivory-garden/garden-bamboo.webp',
  'garden-koi':'/assets/premium/ivory-garden/garden-koi.webp',
  'garden-lantern':'/assets/premium/ivory-garden/garden-lantern.webp',
  'garden-fan':'/assets/premium/ivory-garden/garden-fan.webp',
  'garden-bluebird':'/assets/premium/ivory-garden/garden-bluebird.webp'
});

export const PREMIUM_MATERIALS=Object.freeze(Object.fromEntries(['mahogany','naturalWood','chrome','brushedSteel','clearGlass','frostedGlass','ceramic','leather','fabric','fur','stone','decorativeMetal'].map(id=>[id,{key:`premium:tile-material-${id}`,url:`/assets/premium/tile-material-${id}.webp`}])));
export const PREMIUM_TILE_MATERIALS=new Set(Object.keys(PREMIUM_MATERIALS));
