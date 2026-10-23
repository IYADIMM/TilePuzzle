import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser } from './qa-helpers.mjs';

const root=process.cwd(),audioDir=path.join(root,'public','assets','audio');
const specs=[
  {kind:'tap',output:'tile_select_variant_b.wav',seed:173,body:820,glint:2360},
  {kind:'tap',output:'tile_select_variant_c.wav',seed:281,body:965,glint:2870},
  {kind:'win',output:'level_complete_variant_b.wav',notes:[523.25,659.25,783.99,1046.5],seed:419},
  {kind:'win',output:'level_complete_variant_c.wav',notes:[587.33,739.99,880,1174.66],seed:557}
];

await mkdir(audioDir,{recursive:true});const browser=await launchQaBrowser();
try{
  const page=await browser.newPage();await page.setContent('<!doctype html><title>Original Audio Variant Renderer</title>');
  for(const spec of specs){
    const base64=await page.evaluate(async spec=>{
      const sampleRate=44100,duration=spec.kind==='tap'?.48:2.45,offline=new OfflineAudioContext(2,Math.ceil(sampleRate*duration),sampleRate),master=offline.createDynamicsCompressor();master.threshold.value=-13;master.knee.value=18;master.ratio.value=3;master.attack.value=.004;master.release.value=.18;master.connect(offline.destination);
      const tone=(frequency,start,length,volume,type='sine')=>{const oscillator=offline.createOscillator(),gain=offline.createGain();oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);oscillator.frequency.exponentialRampToValueAtTime(frequency*.82,start+length);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.006);gain.gain.exponentialRampToValueAtTime(.0001,start+length);oscillator.connect(gain).connect(master);oscillator.start(start);oscillator.stop(start+length+.01);};
      const noise=(start,length,volume,frequency)=>{let state=spec.seed>>>0;const buffer=offline.createBuffer(1,Math.ceil(sampleRate*length),sampleRate),data=buffer.getChannelData(0);for(let index=0;index<data.length;index++){state=(1664525*state+1013904223)>>>0;data[index]=(state/4294967296*2-1)*Math.pow(1-index/data.length,2);}const source=offline.createBufferSource(),filter=offline.createBiquadFilter(),gain=offline.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=1.8;gain.gain.setValueAtTime(volume,start);gain.gain.exponentialRampToValueAtTime(.0001,start+length);source.connect(filter).connect(gain).connect(master);source.start(start);};
      if(spec.kind==='tap'){noise(0,.055,.16,spec.glint);tone(spec.body,0,.18,.2,'sine');tone(spec.glint,.018,.12,.07,'triangle');tone(spec.glint*1.62,.052,.14,.025,'sine');}
      else{spec.notes.forEach((frequency,index)=>{const start=.1+index*.27;tone(frequency,start,.72,.15,index%2?'triangle':'sine');tone(frequency*2,start+.018,.48,.035,'sine');noise(start,.05,.025,frequency*2.4);});tone(spec.notes.at(-1)*1.5,1.18,1.05,.07,'sine');tone(spec.notes.at(-1)*2,1.34,.82,.04,'sine');}
      const rendered=await offline.startRendering(),channels=Array.from({length:rendered.numberOfChannels},(_,index)=>rendered.getChannelData(index)),bytes=44+rendered.length*rendered.numberOfChannels*2,wav=new ArrayBuffer(bytes),view=new DataView(wav),write=(offset,text)=>{for(let index=0;index<text.length;index++)view.setUint8(offset+index,text.charCodeAt(index));};
      write(0,'RIFF');view.setUint32(4,bytes-8,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,rendered.numberOfChannels,true);view.setUint32(24,rendered.sampleRate,true);view.setUint32(28,rendered.sampleRate*rendered.numberOfChannels*2,true);view.setUint16(32,rendered.numberOfChannels*2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,bytes-44,true);
      let offset=44;for(let frame=0;frame<rendered.length;frame++)for(let channel=0;channel<channels.length;channel++){const sample=Math.max(-1,Math.min(1,channels[channel][frame]));view.setInt16(offset,sample<0?sample*0x8000:sample*0x7fff,true);offset+=2;}
      const data=new Uint8Array(wav),chunks=[];for(let index=0;index<data.length;index+=0x8000)chunks.push(String.fromCharCode(...data.subarray(index,index+0x8000)));return btoa(chunks.join(''));
    },spec);
    await writeFile(path.join(audioDir,spec.output),Buffer.from(base64,'base64'));console.log(`rendered ${spec.output}`);
  }
}finally{await browser.close();}
