import * as THREE from 'three';
import { EventBus } from './EventBus.js';

const KEY='bangladrive_ghost_v6';
const SAMPLE_INTERVAL=.1;
const MAX_SAMPLES=36000;
export class GhostSystem {
  constructor(scene,car,storage=globalThis.localStorage){
    this.scene=scene;this.storage=storage;this.capacity=MAX_SAMPLES;this.recording=new Float32Array(MAX_SAMPLES*5);this.count=0;this.sampleClock=0;this.runTime=0;this.playhead=0;this.playIndex=0;this.active=false;this.playing=false;this.bestTime=Infinity;this.bestCount=0;this.bestData=new Float32Array(0);this.best=this.load();
    this.ghost=car.clone(true);this.ghost.name='time-trial-ghost';this.ghost.traverse(node=>{if(node.isMesh){node.castShadow=false;node.receiveShadow=false;if(Array.isArray(node.material))node.material=node.material.map(m=>this.ghostMaterial(m));else node.material=this.ghostMaterial(node.material);}});this.ghost.visible=false;this.ghost.renderOrder=3;scene.add(this.ghost);
    this.cursor=0;this.unsubs=[EventBus.on('modeStarted',({mode})=>this.start(mode)),EventBus.on('modeResult',({mode,score})=>this.finish(mode,score))];
  }
  ghostMaterial(source){const material=source.clone();material.transparent=true;material.opacity=.3;material.depthWrite=false;material.color.set('#8aeaff');if(material.emissive)material.emissive.set('#1685a4');if('emissiveIntensity'in material)material.emissiveIntensity=.7;return material;}
  load(){try{const saved=JSON.parse(this.storage?.getItem(KEY)||'null');if(!saved||!Array.isArray(saved.samples)||saved.samples.length<5)return false;this.bestTime=Number(saved.time)||Infinity;this.bestCount=Math.min(Math.floor(saved.samples.length/5),this.capacity);this.bestData=new Float32Array(this.bestCount*5);for(let i=0;i<this.bestData.length;i++)this.bestData[i]=Number(saved.samples[i])||0;return true;}catch{return false;}}
  start(mode){this.active=mode==='Time Trial';this.runTime=0;this.sampleClock=0;this.count=0;this.cursor=0;this.playhead=0;this.playIndex=0;this.playing=this.active&&this.best;this.ghost.visible=this.playing;}
  update(dt,state){if(!this.active)return;this.runTime+=dt;this.sampleClock+=dt;if(this.sampleClock>=SAMPLE_INTERVAL&&this.count<this.capacity){this.sampleClock-=SAMPLE_INTERVAL;const o=this.count*5;this.recording[o]=state.x;this.recording[o+1]=state.y;this.recording[o+2]=state.z;this.recording[o+3]=state.yaw;this.recording[o+4]=this.runTime;this.count++;}
    if(!this.playing||!this.bestCount)return;this.playhead+=dt;if(this.playhead>this.bestData[(this.bestCount-1)*5+4]){this.ghost.visible=false;this.playing=false;return;}while(this.playIndex<this.bestCount-2&&this.bestData[(this.playIndex+1)*5+4]<this.playhead)this.playIndex++;const a=this.playIndex,b=Math.min(a+1,this.bestCount-1),oa=a*5,ob=b*5,t0=this.bestData[oa+4],t1=this.bestData[ob+4],alpha=t1>t0?(this.playhead-t0)/(t1-t0):0;this.ghost.position.set(THREE.MathUtils.lerp(this.bestData[oa],this.bestData[ob],alpha),THREE.MathUtils.lerp(this.bestData[oa+1],this.bestData[ob+1],alpha),THREE.MathUtils.lerp(this.bestData[oa+2],this.bestData[ob+2],alpha));this.ghost.rotation.y=THREE.MathUtils.lerp(this.bestData[oa+3],this.bestData[ob+3],alpha);
  }
  finish(mode,score){if(mode!=='Time Trial'||!this.active)return false;this.active=false;this.ghost.visible=false;if(!this.count||score>=this.bestTime)return false;this.bestTime=score;this.bestCount=this.count;this.bestData=this.recording.slice(0,this.count*5);this.best=true;try{this.storage?.setItem(KEY,JSON.stringify({version:6,time:score,samples:Array.from(this.bestData)}));}catch{return false;}EventBus.emit('ghostRecord',{time:score,samples:this.bestCount});return true;}
  dispose(){this.unsubs.forEach(off=>off());this.scene.remove(this.ghost);this.ghost.traverse(node=>{if(node.isMesh){if(Array.isArray(node.material))node.material.forEach(m=>m.dispose());else node.material.dispose();}});}
  static get storageKey(){return KEY;}
}
