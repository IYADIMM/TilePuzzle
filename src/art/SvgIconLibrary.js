import { THEMES } from '../data/themes.js';

const iconMeta = new Map(THEMES.flatMap(theme => theme.iconIds.map((id, index) => [id, { theme: theme.id, index }])));

export function createIconSvg(iconId) {
  const meta = iconMeta.get(iconId);
  if (!meta) throw new Error(`Unknown vector icon: ${iconId}`);
  const body = RENDERERS[meta.theme](iconId, meta.index);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><defs><linearGradient id="shine" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".96"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/></linearGradient><filter id="iconDepth" x="-35%" y="-35%" width="170%" height="180%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#13201c" flood-opacity=".34"/><feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="soft"/><feSpecularLighting in="soft" surfaceScale="5" specularConstant=".55" specularExponent="18" lighting-color="#ffffff" result="spec"><feDistantLight azimuth="225" elevation="48"/></feSpecularLighting><feComposite in="spec" in2="SourceAlpha" operator="in" result="lit"/><feBlend in="SourceGraphic" in2="lit" mode="screen"/></filter></defs><g transform="translate(96 96) scale(1.08) translate(-96 -96)" filter="url(#iconDepth)" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

export function svgDataUri(svg) { return `data:image/svg+xml;base64,${globalThis.btoa(svg)}`; }
export function allIconIds() { return [...iconMeta.keys()]; }

const RENDERERS = {
  fruits: fruitIcon,
  cars: carIcon,
  sports: sportIcon,
  'auto-parts': partIcon,
  'wild-animals': wildIcon,
  pets: petIcon,
  desserts: dessertIcon,
  flowers: flowerIcon,
  'ocean-life': oceanIcon,
  music: musicIcon,
  travel: travelIcon,
  space: spaceIcon
};

function fruitIcon(id) {
  if (id === 'cherries') return `<path d="M79 72c7-25 18-37 38-43" fill="none" stroke="#438d32" stroke-width="10"/><path d="M112 31c20-12 34-7 40 8-19 8-32 5-40-8Z" fill="#65b93b" stroke="#2d7a2d" stroke-width="4"/><circle cx="63" cy="112" r="35" fill="#d92343" stroke="#a9102c" stroke-width="6"/><circle cx="120" cy="119" r="37" fill="#ed3150" stroke="#ad132f" stroke-width="6"/><ellipse cx="51" cy="96" rx="11" ry="15" fill="url(#shine)"/><ellipse cx="108" cy="101" rx="12" ry="16" fill="url(#shine)"/>`;
  if (id === 'orange') return `<defs><radialGradient id="orangeVolume" cx="31%" cy="24%"><stop stop-color="#ffc54d"/><stop offset=".42" stop-color="#f58d15"/><stop offset="1" stop-color="#d85b08"/></radialGradient><clipPath id="orangeMask"><circle cx="96" cy="105" r="57"/></clipPath></defs><circle cx="96" cy="105" r="58" fill="url(#orangeVolume)" stroke="#b94c07" stroke-width="7"/><g clip-path="url(#orangeMask)" fill="#ffd16a" opacity=".52">${dots(96,108,6,6,18)}</g><path d="M94 48c8-18 20-28 36-31" fill="none" stroke="#684018" stroke-width="8"/><path d="M116 28c25-12 42-3 46 15-23 7-38 2-46-15Z" fill="#55b939" stroke="#26762b" stroke-width="5"/><ellipse cx="73" cy="78" rx="16" ry="21" fill="url(#shine)"/>`;
  if (id === 'strawberry') return `<defs><radialGradient id="berryVolume" cx="30%" cy="24%"><stop stop-color="#ff6475"/><stop offset=".48" stop-color="#e93250"/><stop offset="1" stop-color="#b70e32"/></radialGradient><clipPath id="strawberryMask"><path d="M96 158C58 136 38 101 48 65c8-28 30-35 48-18 18-17 40-10 48 18 10 36-10 71-48 93Z"/></clipPath></defs><path d="M96 158C58 136 38 101 48 65c8-28 30-35 48-18 18-17 40-10 48 18 10 36-10 71-48 93Z" fill="url(#berryVolume)" stroke="#9f1230" stroke-width="7"/><g clip-path="url(#strawberryMask)" fill="#ffe28a">${dots(96,103,5,5,18)}</g><path d="M52 58c18 1 30-9 44-30 14 21 26 31 44 30-12 15-27 20-44 13-17 7-32 2-44-13Z" fill="#58b23a" stroke="#28752d" stroke-width="5"/><ellipse cx="70" cy="72" rx="12" ry="22" fill="url(#shine)"/>`;
  if (id === 'pineapple') return `<path d="M62 70c7-22 23-29 34-12 11-17 27-10 34 12 12 38 4 81-34 94-38-13-46-56-34-94Z" fill="#f1b52b" stroke="#c17e13" stroke-width="7"/><path d="M69 57 51 23c19 3 31 11 45 28-2-23 2-38 13-49 8 20 8 34 3 50 15-17 29-22 42-20-13 22-26 31-42 34Z" fill="#50a33b" stroke="#28752d" stroke-width="5"/><path d="m64 86 64 45M64 126l61-43M59 105h74" stroke="#d18c17" stroke-width="5" opacity=".8"/>`;
  if (id === 'watermelon') return `<path d="M31 116c12-60 73-95 130-60-11 59-69 98-130 60Z" fill="#ef4763" stroke="#2d963d" stroke-width="13"/><path d="M36 113c13 7 25 12 38 14" fill="none" stroke="#a8dc52" stroke-width="5"/><g fill="#662429"><ellipse cx="76" cy="91" rx="4" ry="9"/><ellipse cx="103" cy="77" rx="4" ry="9"/><ellipse cx="124" cy="99" rx="4" ry="9"/></g><path d="M49 86c10-20 26-34 46-42" stroke="url(#shine)" stroke-width="11" fill="none"/>`;
  return `<path d="M95 61c4-24 14-37 32-47" fill="none" stroke="#4e7e2b" stroke-width="8"/><path d="M119 25c18-8 31-2 35 12-17 7-29 3-35-12Z" fill="#61a839" stroke="#30762b" stroke-width="4"/><g fill="#7946a8" stroke="#573077" stroke-width="4"><circle cx="74" cy="74" r="22"/><circle cx="107" cy="72" r="22"/><circle cx="58" cy="105" r="22"/><circle cx="93" cy="105" r="24"/><circle cx="126" cy="106" r="22"/><circle cx="77" cy="137" r="22"/><circle cx="111" cy="137" r="22"/></g><ellipse cx="66" cy="65" rx="8" ry="10" fill="url(#shine)"/>`;
}

function carIcon(id, i) {
  const colors = [['#ff6b5d','#c51f31'],['#62a8e5','#24639d'],['#6fbe72','#347243'],['#ff5b36','#bb2118'],['#ffd352','#d68b10'],['#b47be2','#7040a2']];
  const roofs = [66,58,54,72,61,50];
  const body = i === 1 ? 'M35 98 52 67h84l24 32v35H31Z' : i === 2 ? 'M27 90 47 51h101l18 39v45H25Z' : 'M24 103 47 72h91l28 31v31H22Z';
  const roof = i === 5 ? 'M58 81h67' : `M55 88 72 ${roofs[i]}h49l24 22Z`;
  return `<defs><linearGradient id="carPaint" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colors[i][0]}"/><stop offset=".58" stop-color="${colors[i][0]}"/><stop offset="1" stop-color="${colors[i][1]}"/></linearGradient><linearGradient id="carGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8fbff"/><stop offset=".48" stop-color="#8dc6dd"/><stop offset="1" stop-color="#315a72"/></linearGradient></defs><path d="${body}" fill="url(#carPaint)" stroke="#26363d" stroke-width="6"/><path d="${roof}" fill="url(#carGlass)" stroke="#304e5c" stroke-width="5"/><path d="M35 104h122" stroke="#fff" stroke-opacity=".55" stroke-width="6"/><path d="M27 124h137" stroke="#712629" stroke-opacity=".42" stroke-width="5"/><g><circle cx="57" cy="135" r="20" fill="#20282c" stroke="#8e9ba4" stroke-width="6"/><circle cx="57" cy="135" r="8" fill="#dbe3e7"/><circle cx="137" cy="135" r="20" fill="#20282c" stroke="#8e9ba4" stroke-width="6"/><circle cx="137" cy="135" r="8" fill="#dbe3e7"/></g><path d="M31 104h16" stroke="#fff1a6" stroke-width="8"/><path d="M148 104h13" stroke="#ff6b62" stroke-width="7"/><path d="M67 82q35-17 68 0" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5"/>${i===3?'<path d="M86 73h22l10 62H75Z" fill="#fff" opacity=".72"/>':''}${i===4?'<rect x="75" y="48" width="44" height="18" rx="7" fill="#ffd75b" stroke="#7c4c12" stroke-width="4"/>':''}`;
}

function sportIcon(id) {
  if (id === 'trophy') return `<defs><linearGradient id="cupGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff09a"/><stop offset=".35" stop-color="#f5c13c"/><stop offset="1" stop-color="#c36d0c"/></linearGradient></defs><path d="M66 35h60v55c0 27-60 27-60 0Z" fill="url(#cupGold)" stroke="#a96a12" stroke-width="7"/><path d="M66 49H37c0 32 13 47 38 50M126 49h29c0 32-13 47-38 50" fill="none" stroke="#d99018" stroke-width="9"/><path d="M96 111v28M69 157h54M79 139h34" stroke="#a96a12" stroke-width="10"/><path d="M79 45h34" stroke="#fff4a6" stroke-width="7" opacity=".8"/>`;
  const map = { soccer:['#f4f4ef','#252b2d'], basketball:['#e98428','#4c2a1a'], tennis:['#b9de39','#f5f7dd'], baseball:['#f3f0e8','#c83b40'], football:['#9b552f','#f5e8c7'] };
  const [base,line]=map[id];
  if (id === 'football') return `<path d="M31 98c26-55 88-73 130-21-25 56-87 74-130 21Z" fill="${base}" stroke="#5f321f" stroke-width="7"/><path d="m76 70 42 42M83 70l-15 15m29-2-15 15m29-2-15 15m29-2-15 15" stroke="${line}" stroke-width="6"/>`;
  return `<defs><radialGradient id="ballVolume" cx="30%" cy="24%"><stop stop-color="#fff" stop-opacity=".82"/><stop offset=".32" stop-color="${base}"/><stop offset="1" stop-color="${line}" stop-opacity=".78"/></radialGradient></defs><circle cx="96" cy="96" r="61" fill="url(#ballVolume)" stroke="#3b4848" stroke-width="7"/>${id==='soccer'?'<path d="m96 64 28 20-11 33H79L68 84Zm0 0V35m28 49 28-9m-39 42 16 27m-50-27-17 27M68 84l-28-9" fill="#252b2d" stroke="#252b2d" stroke-width="5"/>':id==='basketball'?'<path d="M38 75c35 4 62 31 66 77M88 36c4 35 31 62 66 66M38 116c39-20 78-20 116 0M76 38c20 39 20 78 0 116" fill="none" stroke="#4c2a1a" stroke-width="6"/>':id==='tennis'?'<path d="M53 48c31 21 56 73 80 99M48 137c31-20 55-62 96-80" fill="none" stroke="#f5f7dd" stroke-width="8"/>':'<path d="M48 62c20 8 25 21 24 35s-6 28-24 34m96-69c-20 8-25 21-24 35s6 28 24 34" fill="none" stroke="#c83b40" stroke-width="6"/><path d="m68 83 10 6m-11 8 11 4m46-18-10 6m11 8-11 4" stroke="#c83b40" stroke-width="3"/>'}`;
}

function partIcon(id) {
  if (id === 'gear') return `<path d="M83 22h26l5 20 18 8 18-10 18 18-10 18 8 18 20 5v26l-20 5-8 18 10 18-18 18-18-10-18 8-5 20H83l-5-20-18-8-18 10-18-18 10-18-8-18-20-5V99l20-5 8-18-10-18 18-18 18 10 18-8Z" fill="#87939d" stroke="#45515a" stroke-width="6"/><circle cx="96" cy="112" r="29" fill="#dce3e7" stroke="#45515a" stroke-width="9"/>`;
  if (id === 'spark-plug') return `<path d="m114 24 31 23-54 72-31-23Z" fill="#e8ecee" stroke="#525d65" stroke-width="6"/><path d="m68 87 34 25-23 31-34-25Z" fill="#7e8a94" stroke="#404950" stroke-width="6"/><path d="m55 125-18 25m28-17-17 25m57-116 21 16" stroke="#d7a331" stroke-width="8"/>`;
  if (id === 'tire') return `<circle cx="96" cy="96" r="67" fill="#22282b" stroke="#505a61" stroke-width="7"/><circle cx="96" cy="96" r="34" fill="#aab3b9" stroke="#59636a" stroke-width="8"/><circle cx="96" cy="96" r="11" fill="#424b51"/><path d="M52 46 38 62m102-16 14 16M35 112l-6 21m128-21 6 21" stroke="#7a858b" stroke-width="6"/>`;
  if (id === 'piston') return `<rect x="55" y="29" width="82" height="63" rx="12" fill="#a8b1b7" stroke="#4a555d" stroke-width="7"/><path d="M62 47h68M62 66h68M85 92v48h22V92M69 151h54" stroke="#59656c" stroke-width="8"/><circle cx="96" cy="53" r="11" fill="#d9e0e3"/>`;
  if (id === 'steering-wheel') return `<circle cx="96" cy="96" r="65" fill="none" stroke="#343b3f" stroke-width="18"/><circle cx="96" cy="96" r="21" fill="#7d8991" stroke="#343b3f" stroke-width="7"/><path d="M96 75V37M77 104l-35 28m73-28 35 28" stroke="#343b3f" stroke-width="13"/>`;
  return `<circle cx="96" cy="96" r="66" fill="#aab4ba" stroke="#4b565e" stroke-width="7"/><circle cx="96" cy="96" r="38" fill="#dce2e5" stroke="#647078" stroke-width="7"/><circle cx="96" cy="96" r="12" fill="#4b565e"/>${radialDots(96,96,50,8,6,'#535f67')}`;
}

function wildIcon(id, i) {
  const colors=[['#d59635','#9a5a20'],['#9aa3a6','#667276'],['#f1eee3','#292d2f'],['#e5b04b','#9d6d29'],['#e0822e','#2b2723'],['#f4f1e8','#252b2c']][i];
  const ears = i===1?'<path d="M48 68C9 49 18 117 52 116m92-48c39-19 30 49-4 48" fill="#9aa3a6" stroke="#667276" stroke-width="6"/>':'<circle cx="53" cy="63" r="25" fill="'+colors[0]+'"/><circle cx="139" cy="63" r="25" fill="'+colors[0]+'"/>';
  return `${ears}<path d="M45 81c0-38 23-60 51-60s51 22 51 60v37c0 34-23 52-51 52s-51-18-51-52Z" fill="${colors[0]}" stroke="${colors[1]}" stroke-width="7"/>${animalMarks(id)}<circle cx="75" cy="91" r="7" fill="#202525"/><circle cx="117" cy="91" r="7" fill="#202525"/><path d="M84 119q12 14 24 0" fill="none" stroke="#5b3427" stroke-width="6"/><path d="M90 108h12l-6 8Z" fill="#4a2c25"/>`;
}

function animalMarks(id) {
  if (id==='lion') return '<path d="M42 78Q19 37 52 25 67 3 96 18q29-15 44 7 33 12 10 53" fill="#b96d25" stroke="#814619" stroke-width="8"/>';
  if (id==='elephant') return '<path d="M93 112v45q0 16 14 0v-32" fill="#9aa3a6" stroke="#667276" stroke-width="7"/>';
  if (id==='zebra') return '<path d="m62 39 17 42M95 24l-5 57m35-43-17 43m-52 35 25-10m55 10-25-10" stroke="#292d2f" stroke-width="10"/>';
  if (id==='giraffe') return '<g fill="#9d6d29"><circle cx="70" cy="61" r="9"/><circle cx="116" cy="50" r="10"/><circle cx="129" cy="118" r="8"/><circle cx="66" cy="132" r="10"/></g><path d="M70 29 64 8m55 21 6-21" stroke="#9d6d29" stroke-width="7"/>';
  if (id==='tiger') return '<path d="m58 46 19 31m57-31-19 31M51 103l27 8m63-8-27 8" stroke="#2b2723" stroke-width="9"/>';
  return '<path d="M48 65q20-28 35 4m61-4q-20-28-35 4M58 104q18-22 31 4m45-4q-18-22-31 4" fill="#252b2c"/>';
}

function petIcon(id, i) {
  const base=['#c68c54','#9d8d83','#f1e5cf','#c99b68','#45a85a','#f0a92e'][i];
  if(id==='parrot') return `<path d="M57 115c0-50 22-82 58-82 34 0 47 39 18 58-19 12-31 24-32 55Z" fill="#45a85a" stroke="#267536" stroke-width="7"/><path d="M119 55h45l-33 28" fill="#f1b42b" stroke="#a66514" stroke-width="5"/><circle cx="117" cy="50" r="7" fill="#222"/><path d="m76 97-26 60m45-53 9 56" stroke="#2d7350" stroke-width="8"/>`;
  if(id==='goldfish') return `<path d="M41 99c22-39 67-48 96-13l28-27v74l-28-25c-29 34-74 26-96-9Z" fill="#f0a92e" stroke="#c46c16" stroke-width="7"/><circle cx="75" cy="84" r="7" fill="#222"/><path d="M94 71q18 25 0 51M54 105q31 14 65 0" fill="none" stroke="#ffd063" stroke-width="5"/>`;
  const ear = id==='rabbit'?'<path d="M62 62Q43 2 73 8l19 55m38-1Q149 2 119 8l-19 55" fill="#f1e5cf" stroke="#b99f8f" stroke-width="7"/>':id==='puppy'?'<path d="M60 58Q18 37 34 99l32-17m66-24q42-21 26 41l-32-17" fill="#9b6439" stroke="#704224" stroke-width="7"/>':'<path d="m55 65 8-45 31 37m43 8-8-45-31 37" fill="'+base+'" stroke="#6e5548" stroke-width="7"/>';
  return `${ear}<path d="M49 72c7-31 27-45 47-45s40 14 47 45v50c0 31-22 48-47 48s-47-17-47-48Z" fill="${base}" stroke="#6e5548" stroke-width="7"/><circle cx="76" cy="94" r="7" fill="#26302e"/><circle cx="116" cy="94" r="7" fill="#26302e"/><ellipse cx="96" cy="116" rx="11" ry="8" fill="#5a3530"/><path d="M82 131q14 15 28 0" fill="none" stroke="#5a3530" stroke-width="5"/>`;
}

function dessertIcon(id) {
  if(id==='cupcake') return `<path d="M52 83h88l-13 73H65Z" fill="#79b7c6" stroke="#3d7d8b" stroke-width="7"/><path d="M49 86c-12-26 10-42 30-31 3-28 42-34 49-6 25-7 38 18 21 37Z" fill="#ef8ab4" stroke="#c45888" stroke-width="7"/><circle cx="98" cy="42" r="10" fill="#df3554"/>`;
  if(id==='donut') return `<circle cx="96" cy="96" r="64" fill="#d59658" stroke="#9b5c2c" stroke-width="7"/><circle cx="96" cy="96" r="24" fill="#fff7df" stroke="#9b5c2c" stroke-width="6"/><path d="M40 79c20-42 84-52 113-11-11 20-29 27-48 21-19-6-35 6-65-10Z" fill="#ed7da9"/><g stroke-width="5">${sprinkles()}</g>`;
  if(id==='ice-cream') return `<path d="m67 90 29 74 29-74Z" fill="#d99a52" stroke="#9c642d" stroke-width="7"/><circle cx="75" cy="76" r="30" fill="#ef88ae" stroke="#c65c86" stroke-width="6"/><circle cx="113" cy="76" r="31" fill="#f4c85b" stroke="#c89a2c" stroke-width="6"/><circle cx="96" cy="49" r="29" fill="#85c4bb" stroke="#4b938b" stroke-width="6"/>`;
  if(id==='macaron') return `<path d="M38 82c5-31 29-49 58-49s53 18 58 49Z" fill="#d77fac" stroke="#9e4d79" stroke-width="7"/><rect x="35" y="82" width="122" height="29" rx="13" fill="#fff0c8" stroke="#b4774c" stroke-width="6"/><path d="M38 111h116c-5 31-29 48-58 48s-53-17-58-48Z" fill="#d77fac" stroke="#9e4d79" stroke-width="7"/>`;
  if(id==='cake') return `<path d="M43 71h108v78H43Z" fill="#f0b57a" stroke="#a96839" stroke-width="7"/><path d="M43 71 96 39l55 32" fill="#fff0d6" stroke="#a96839" stroke-width="7"/><path d="M43 101h108" stroke="#ef7ea9" stroke-width="18"/><circle cx="96" cy="34" r="10" fill="#dc354f"/>`;
  return `<circle cx="96" cy="96" r="63" fill="#c88a48" stroke="#8d5729" stroke-width="7"/><g fill="#5d3522"><circle cx="68" cy="65" r="8"/><circle cx="118" cy="62" r="7"/><circle cx="91" cy="102" r="9"/><circle cx="132" cy="119" r="7"/><circle cx="61" cy="130" r="8"/></g><path d="M50 65q25-31 52-29" stroke="url(#shine)" stroke-width="10" fill="none"/>`;
}

function flowerIcon(id, i) {
  const petal=['#ef72a8','#f0b72e','#eb5b71','#d73954','#f4f0db','#8e74c8'][i];
  const count=id==='tulip'?3:id==='lavender'?8:6;
  if(id==='tulip') return `<path d="M61 54q35 5 35-30 0 35 35 30 0 58-35 62-35-4-35-62Z" fill="${petal}" stroke="#a83c56" stroke-width="7"/><path d="M96 115v52m0-27-32-18m32 26 31-20" stroke="#3f963c" stroke-width="9"/>`;
  if(id==='lavender') return `<path d="M96 38v129" stroke="#4f8f3d" stroke-width="8"/>${Array.from({length:8},(_,k)=>`<ellipse cx="${k%2?112:80}" cy="${43+k*13}" rx="18" ry="11" transform="rotate(${k%2?25:-25} ${k%2?112:80} ${43+k*13})" fill="${petal}" stroke="#63519e" stroke-width="4"/>`).join('')}`;
  return `${Array.from({length:count},(_,k)=>{const a=k*360/count;return `<ellipse cx="96" cy="55" rx="22" ry="42" transform="rotate(${a} 96 96)" fill="${petal}" stroke="#a84367" stroke-width="4"/>`}).join('')}<circle cx="96" cy="96" r="25" fill="${id==='sunflower'?'#71401f':'#f4ba2d'}" stroke="#a36a14" stroke-width="5"/><circle cx="84" cy="78" r="10" fill="url(#shine)"/>`;
}

function oceanIcon(id, i) {
  const c=['#4baec8','#53a86e','#d48b56','#e98263','#9a6bc4','#edc94d'][i];
  if(id==='starfish') return `<path d="m96 25 18 48 51 2-40 32 14 50-43-29-43 29 14-50-40-32 51-2Z" fill="${c}" stroke="#bd5540" stroke-width="7"/>${radialDots(96,96,30,7,4,'#f5b07d')}`;
  if(id==='octopus') return `<circle cx="96" cy="75" r="45" fill="${c}" stroke="#684892" stroke-width="7"/><path d="M57 95q-25 39 4 57t28-40q-8 52 18 49t11-49q0 44 24 37t-6-53" fill="none" stroke="${c}" stroke-width="18"/><circle cx="79" cy="68" r="7"/><circle cx="113" cy="68" r="7"/>`;
  if(id==='turtle') return `<ellipse cx="96" cy="98" rx="51" ry="43" fill="${c}" stroke="#347149" stroke-width="7"/><circle cx="151" cy="93" r="19" fill="#73bd7f" stroke="#347149" stroke-width="6"/><path d="m59 67-28-21m25 85-30 21m107-17 24 21M98 57v82M52 98h88" stroke="#347149" stroke-width="7"/>`;
  if(id==='seahorse') return `<path d="M116 35c-35-14-57 11-42 37 9 16 31 12 29 31-2 19-30 13-31 38-1 25 35 30 44 8-20 8-26-9-12-17 24-14 30-38 18-57l20-20Z" fill="${c}" stroke="#9e6239" stroke-width="7"/><circle cx="105" cy="53" r="6"/>`;
  const fish=id==='dolphin'?`<path d="M27 105c36-54 94-64 139-25l-31 12c-16 40-65 51-108 13Z" fill="${c}" stroke="#34758c" stroke-width="7"/><path d="m99 66 8-30 25 35m-58 55-5 29 30-26" fill="${c}" stroke="#34758c" stroke-width="6"/><circle cx="137" cy="78" r="5"/>`:`<path d="M32 96c30-42 79-50 112-14l26-24v76l-26-24c-33 36-82 28-112-14Z" fill="${c}" stroke="#a77719" stroke-width="7"/><path d="m73 70 20 26-20 27m44-53-20 26 20 27" stroke="#e86d5a" stroke-width="8"/><circle cx="126" cy="84" r="6"/>`;
  return fish;
}

function musicIcon(id) {
  if(id==='guitar') return `<ellipse cx="79" cy="120" rx="42" ry="50" fill="#c87b35" stroke="#77431e" stroke-width="7"/><circle cx="84" cy="116" r="17" fill="#4c2a19"/><path d="m103 84 46-65 18 12-49 67M68 72l68 51" stroke="#75401e" stroke-width="12"/><path d="m91 73 55-48" stroke="#f2c77c" stroke-width="3"/>`;
  if(id==='piano') return `<rect x="26" y="47" width="140" height="98" rx="13" fill="#f5f2e9" stroke="#25292b" stroke-width="7"/>${[0,1,2,3,4,5,6].map(k=>`<path d="M${46+k*18} 49v94" stroke="#333" stroke-width="3"/>`).join('')}${[0,1,3,4,5].map(k=>`<rect x="${41+k*18}" y="47" width="11" height="56" rx="3" fill="#25292b"/>`).join('')}`;
  if(id==='drum') return `<ellipse cx="96" cy="56" rx="61" ry="25" fill="#e8c260" stroke="#73451f" stroke-width="7"/><path d="M35 56v78c20 27 102 27 122 0V56" fill="#b84a3e" stroke="#73451f" stroke-width="7"/><path d="m44 69 104 66M148 69 44 135" stroke="#f0c679" stroke-width="6"/><path d="m47 26 101 57m-4-57L43 83" stroke="#7f552f" stroke-width="6"/>`;
  if(id==='saxophone') return `<path d="M77 28h48l-5 24H99v53c0 29 32 34 46 12l18 15c-23 43-88 31-88-23V52Z" fill="#e7ad2c" stroke="#9c6415" stroke-width="8"/><path d="M119 117h39l11 28h-62" fill="#f1c94e" stroke="#9c6415" stroke-width="7"/>${radialDots(104,79,18,4,5,'#7b5018')}`;
  if(id==='headphones') return `<path d="M39 101V83c0-75 114-75 114 0v18" fill="none" stroke="#485461" stroke-width="18"/><rect x="25" y="91" width="40" height="66" rx="18" fill="#596a78" stroke="#2f383e" stroke-width="7"/><rect x="127" y="91" width="40" height="66" rx="18" fill="#596a78" stroke="#2f383e" stroke-width="7"/>`;
  return `<rect x="70" y="25" width="52" height="92" rx="26" fill="#aab5bd" stroke="#4c5961" stroke-width="7"/><path d="M52 91v8c0 58 88 58 88 0v-8M96 137v31M71 169h50" fill="none" stroke="#4c5961" stroke-width="9"/><path d="M76 57h40m-40 18h40m-39 18h38" stroke="#66747d" stroke-width="5"/>`;
}

function travelIcon(id) {
  if(id==='airplane') return `<path d="m23 103 60-16 16-57c3-13 18-13 22 0l4 47 42-11 8 15-46 28 2 38-13 8-18-32-48 25-12-11 38-39-50 18Z" fill="#4d9fc2" stroke="#2c6178" stroke-width="6"/>`;
  if(id==='suitcase') return `<rect x="34" y="58" width="124" height="102" rx="16" fill="#b66c37" stroke="#63391f" stroke-width="8"/><path d="M72 58V39c0-12 48-12 48 0v19M64 61v96m64-96v96" fill="none" stroke="#e0a35f" stroke-width="8"/><rect x="84" y="97" width="24" height="23" rx="5" fill="#efc375"/>`;
  if(id==='camera') return `<path d="M29 67h34l12-20h43l12 20h33v89H29Z" fill="#4c5961" stroke="#252c30" stroke-width="7"/><circle cx="96" cy="110" r="36" fill="#6fb4cf" stroke="#d7e2e8" stroke-width="8"/><circle cx="96" cy="110" r="17" fill="#273b4e"/><rect x="40" y="78" width="25" height="14" rx="5" fill="#d9a044"/>`;
  if(id==='compass') return `<circle cx="96" cy="96" r="67" fill="#e8d7b6" stroke="#8d632d" stroke-width="8"/><circle cx="96" cy="96" r="51" fill="#d8eef0" stroke="#9b7743" stroke-width="5"/><path d="m96 43 18 52-18 54-18-52Z" fill="#d84c43" stroke="#7e3b31" stroke-width="5"/><path d="m96 149 18-54-18 2-18-2Z" fill="#486f91"/>`;
  if(id==='passport') return `<rect x="48" y="25" width="99" height="143" rx="12" fill="#3c6493" stroke="#203b60" stroke-width="7"/><circle cx="98" cy="91" r="31" fill="none" stroke="#e5c56e" stroke-width="5"/><path d="M67 91h62M98 60c-18 18-18 44 0 62m0-62c18 18 18 44 0 62" fill="none" stroke="#e5c56e" stroke-width="4"/><path d="M72 140h52" stroke="#e5c56e" stroke-width="6"/>`;
  return `<circle cx="96" cy="96" r="65" fill="#55a5c5" stroke="#28637c" stroke-width="7"/><path d="M35 83c19-9 29-2 39-14s4-25 23-32m55 47c-18 2-25 17-19 29s-7 25-18 39M74 34c-14 31-14 93 0 124m44-124c14 31 14 93 0 124M32 96h128" fill="none" stroke="#8fd070" stroke-width="8"/>`;
}

function spaceIcon(id) {
  if(id==='rocket') return `<path d="M96 18c35 27 44 73 19 110l-19 29-19-29C52 91 61 45 96 18Z" fill="#e9eef5" stroke="#536487" stroke-width="7"/><circle cx="96" cy="70" r="18" fill="#64b9d0" stroke="#385f83" stroke-width="6"/><path d="M70 105 42 138l35-3m45-30 28 33-35-3" fill="#e2525e" stroke="#8c3040" stroke-width="7"/><path d="m82 144 14 34 14-34" fill="#f2a52d" stroke="#ba6119" stroke-width="6"/>`;
  if(id==='planet') return `<circle cx="96" cy="96" r="51" fill="#8175d0" stroke="#4d478d" stroke-width="7"/><path d="M25 120c32 14 108-2 142-43 8-10-1-20-12-14-36 21-89 36-128 34-15-1-18 16-2 23Z" fill="#e4b851" stroke="#986f22" stroke-width="6"/><ellipse cx="77" cy="74" rx="15" ry="10" fill="#a99ee6"/>`;
  if(id==='moon') return `<path d="M126 29c-37 13-54 55-36 90 13 25 40 37 66 30-17 22-47 33-76 22-40-15-60-60-45-100 15-39 55-59 91-42Z" fill="#e6dfc4" stroke="#9c988a" stroke-width="7"/><circle cx="69" cy="94" r="10" fill="#c8c1a9"/>`;
  if(id==='astronaut') return `<path d="M57 86c0-43 16-62 39-62s39 19 39 62v64H57Z" fill="#e8edf2" stroke="#55637a" stroke-width="7"/><rect x="69" y="42" width="54" height="54" rx="24" fill="#6086a8" stroke="#344c6a" stroke-width="7"/><path d="M65 111 35 142m92-31 30 31M79 150v27m34-27v27" stroke="#55637a" stroke-width="12"/><path d="M77 48q19-16 38 0" stroke="url(#shine)" stroke-width="8" fill="none"/>`;
  if(id==='comet') return `<path d="M109 70C80 60 55 73 45 98c-10 27 5 56 32 65 28 9 56-6 65-33 8-24-5-50-33-60Z" fill="#f2b94a" stroke="#b86d1c" stroke-width="7"/><path d="M80 76 20 33m78 35L51 15m13 80L16 80" stroke="#e67242" stroke-width="13"/><circle cx="93" cy="111" r="15" fill="#e39034"/>`;
  return `<rect x="76" y="65" width="40" height="63" rx="9" fill="#9aa8c5" stroke="#4a5576" stroke-width="7"/><path d="M76 78 26 58v70l50-20m40-30 50-20v70l-50-20M96 65V38m0 90v27" fill="#5578bd" stroke="#3c4d78" stroke-width="7"/><circle cx="96" cy="97" r="10" fill="#e6ba42"/>`;
}

function dots(cx,cy,cols,rows,spacing){let out='';for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)out+=`<circle cx="${cx+(c-(cols-1)/2)*spacing}" cy="${cy+(r-(rows-1)/2)*spacing}" r="2.2"/>`;return out;}
function radialDots(cx,cy,r,count,size,color){return Array.from({length:count},(_,i)=>{const a=i*Math.PI*2/count;return `<circle cx="${cx+Math.cos(a)*r}" cy="${cy+Math.sin(a)*r}" r="${size}" fill="${color}"/>`}).join('');}
function sprinkles(){const colors=['#fff36a','#69d4c2','#7a78df','#fff'];return Array.from({length:12},(_,i)=>`<path d="M${48+(i*23)%96} ${55+(i*17)%41}l${i%2?8:-6} ${i%3?3:8}" stroke="${colors[i%4]}"/>`).join('');}
