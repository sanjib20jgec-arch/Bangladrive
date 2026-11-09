import { EventBus } from './EventBus.js';
import { MODE_TARGETS } from './ModeTargets.js';

const medalRank={none:0,bronze:1,silver:2,gold:3};
export function medalForScore(mode,score){const t=MODE_TARGETS[mode];if(!t)return 'none';if(mode==='Time Trial'){return score<=t.gold?'gold':score<=t.silver?'silver':score<=t.bronze?'bronze':'none';}return score>=t.gold?'gold':score>=t.silver?'silver':score>=t.bronze?'bronze':'none';}
export class ModeSession {
  constructor(profile){this.profile=profile;this.state={mode:'Free Roam',active:false,elapsed:0,score:0,integrity:100,heat:0,lastX:0,lastZ:0,justStarted:false};this._off=[EventBus.on('modeSelected',({mode})=>this.start(mode)),EventBus.on('modeFinished',({mode,score})=>this.finish(mode,score))];}
  start(mode){if(!MODE_TARGETS[mode])return false;this.state.mode=mode;this.state.active=true;this.state.elapsed=0;this.state.score=0;this.state.integrity=100;this.state.heat=0;this.state.lastX=0;this.state.lastZ=0;this.state.justStarted=true;EventBus.emit('modeStarted',{mode});return true;}
  update(dt,player){if(!this.state.active)return;if(this.state.justStarted){this.state.lastX=player.x;this.state.lastZ=player.z;this.state.justStarted=false;}this.state.elapsed+=dt;if(this.state.mode==='Escape')this.state.heat=Math.min(3,Math.max(0,Math.floor((player.speedKmh-45)/28)+1));if(this.state.mode==='Delivery'){const dx=player.x-this.state.lastX,dz=player.z-this.state.lastZ;this.state.score+=Math.hypot(dx,dz);this.state.lastX=player.x;this.state.lastZ=player.z;}else if(this.state.mode==='Escape'||this.state.mode==='Time Trial')this.state.score=this.state.elapsed;else if(this.state.mode==='No Damage')this.state.score=this.state.integrity;else this.state.score=Math.round(player.style||0);}
  damage(amount){if(this.state.active&&(this.state.mode==='Delivery'||this.state.mode==='No Damage'))this.state.integrity=Math.max(0,this.state.integrity-amount);}
  finish(mode=this.state.mode,score=this.state.score){if(!this.state.active)return 'none';this.state.active=false;const medal=medalForScore(mode,score);const old=this.profile.data.modeMedals[mode]||'none';if(medalRank[medal]>medalRank[old])this.profile.data.modeMedals[mode]=medal;this.profile.save();EventBus.emit('modeResult',{mode,score,medal});return medal;}
  dispose(){this._off.forEach(off=>off());}
}
