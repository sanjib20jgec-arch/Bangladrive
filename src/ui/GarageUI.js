import { EventBus } from '../core/EventBus.js';
import { DELIVERY_RULES, MODE_TARGETS, RELAY_RULES, RESCUE_RULES } from '../core/ModeTargets.js';
import { CONTRACTS, LIVERIES, UPGRADES, VEHICLES } from '../core/ProfileCatalog.js';
import { modeResultText } from './ModeResultText.js';

const MEDAL={none:'—',bronze:'🥉',silver:'🥈',gold:'🥇'};

export class GarageUI {
  constructor(root,profile,modeSession){this.root=root;this.profile=profile;this.modeSession=modeSession;this.tab='garage';this.open=false;this.tipOpen={garage:false,modes:false};this.unsubs=[];this.mount();this.listen();this.render();}
  mount(){this.root.innerHTML='<button class="garage-launch" id="garage-launch">GARAGE · CHA-STAL</button><section class="garage-overlay hidden" id="garage-overlay"><header><div><b>Bapi’r Garage & Cha-Stall</b><small>টাকা, টিউনিং আর আজকের খেপ</small></div><button id="garage-close" aria-label="Close">✕</button></header><nav class="garage-tabs"><button data-tab="garage">গ্যারেজ</button><button data-tab="modes">মোড ও মেডেল</button></nav><div id="garage-content" class="garage-content"></div></section>';
    this.overlay=this.root.querySelector('#garage-overlay');this.content=this.root.querySelector('#garage-content');this.overlay.setAttribute('role','region');this.overlay.setAttribute('aria-label','গ্যারেজ ও মোড / Garage and modes');this.root.querySelector('.garage-tabs').setAttribute('aria-label','গ্যারেজ বিভাগ / Garage sections');
    this.root.querySelector('#garage-launch').addEventListener('click',()=>this.setOpen(!this.open));this.root.querySelector('#garage-close').addEventListener('click',()=>this.setOpen(false));
    this.root.querySelector('.garage-tabs').addEventListener('click',e=>{const tab=e.target.closest('[data-tab]')?.dataset.tab;if(tab){this.tab=tab;this.render();}});
    this.content.addEventListener('click',e=>this.handleClick(e));
    this.content.addEventListener('toggle',e=>{if(e.target.matches('details.character-tip'))this.tipOpen[e.target.dataset.tip]=e.target.open;},true);
  }
  listen(){
    this.unsubs.push(EventBus.on('nearMiss',()=>{this.profile.progressContract('near-miss');if(this.open)this.render();}));
    this.unsubs.push(EventBus.on('driftTier',()=>{this.profile.progressContract('drift');if(this.open)this.render();}));
    this.unsubs.push(EventBus.on('chaosGain',()=>{this.profile.progressContract('chaos');if(this.open)this.render();}));
    this.unsubs.push(EventBus.on('profileChanged',()=>{if(this.open)this.render();}));
    this.unsubs.push(EventBus.on('modeResult',()=>this.render()));
    this.unsubs.push(EventBus.on('modeStarted',()=>this.render()));
    this.unsubs.push(EventBus.on('modeCancelled',()=>this.render()));
  }
  setOpen(open){this.open=open;this.overlay.classList.toggle('hidden',!open);if(open){this.render();this.root.querySelector('#garage-close').focus({preventScroll:true});}else this.root.ownerDocument.querySelector('#game-canvas')?.focus({preventScroll:true});}
  render(){
    if(!this.content)return;
    const active=this.root.ownerDocument.activeElement;
    const focused=this.open&&this.content.contains(active)?active:null;
    const key=focused&&['vehicle','upgrade','contract','livery','mode','finish'].find(name=>name in focused.dataset);
    const value=key?focused.dataset[key]:null;
    const isTip=focused?.matches('summary')&&focused.parentElement?.matches('details.character-tip');
    this.root.querySelectorAll('.garage-tabs [data-tab]').forEach(button=>{const selected=button.dataset.tab===this.tab;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    if(this.tab==='garage')this.renderGarage();else this.renderModes();
    if(focused){
      const restored=isTip?this.content.querySelector('details.character-tip summary'):
        key?[...this.content.querySelectorAll(`[data-${key}]`)].find(element=>element.dataset[key]===value):null;
      const target=restored&&!restored.disabled?restored:this.root.querySelector(`.garage-tabs [data-tab="${this.tab}"]`);
      target?.focus(); // Let the browser bring the restored control into view.
    }
  }
  renderGarage(){
    const p=this.profile.data;const vehicles=VEHICLES.map(v=>{const unlocked=p.unlockedVehicles.includes(v.id);const selected=p.selectedVehicle===v.id;return `<article class="vehicle-card ${selected?'selected':''}"><i style="--vehicle:${v.color}"></i><div><b>${v.name}</b><small>${unlocked?(selected?'নির্বাচিত':'আনলক করা'):`৳${v.cost} দিয়ে আনলক`}</small></div><button data-vehicle="${v.id}" ${selected?'disabled':''}>${unlocked?'বাছুন':`৳${v.cost}`}</button></article>`;}).join('');
    const upgrades=UPGRADES.map(({id,label,baseCost,maxLevel})=>{const level=p.vehicleUpgrades[id]||0;const cost=baseCost*(level+1);return `<div class="upgrade-row"><span>${label}<small>Tier ${level}/${maxLevel}</small></span><button data-upgrade="${id}" ${level>=maxLevel?'disabled':''}>${level>=maxLevel?'MAX':`৳${cost} · +1`}</button></div>`;}).join('');
    const contracts=CONTRACTS.map(c=>{const progress=Math.min(c.target,p.daily.progress[c.id]||0);const claimed=!!p.daily.claimed[c.id];return `<div class="contract-row"><span>${c.title}<small>${progress}/${c.target} · পুরস্কার ৳${c.reward}</small></span><button data-contract="${c.id}" ${claimed||progress<c.target?'disabled':''}>${claimed?'নেওয়া হয়েছে':'নাও'}</button></div>`;}).join('');
    const liveries=LIVERIES.map(({id,label})=>`<button class="livery ${p.selectedLivery===id?'selected':''}" data-livery="${id}">${label}</button>`).join('');
    this.content.innerHTML=`<details class="character-tip" data-tip="garage" ${this.tipOpen?.garage?'open':''}><summary>গ্যারেজ মেকানিকের পরামর্শ / Mechanic’s tip</summary><p>গাড়ি বাছুন ও টিউন-আপের দাম দেখুন। Settings থেকে auto-drift assist চালু করা যায়; কেনাকাটা বাধ্যতামূলক নয়।</p><p lang="en">Choose a vehicle and check upgrade prices. Auto-drift assist is in Settings; purchases are optional.</p></details><div class="garage-balance">বর্তমান ব্যালান্স <strong>৳${p.taka}</strong></div><h3>গাড়ি বাছুন</h3><div class="vehicle-list">${vehicles}</div><h3>টিউন-আপ</h3><div>${upgrades}</div><h3>লিভারি</h3><div class="livery-list">${liveries}</div><h3>আজকের ৩ খেপ</h3><div>${contracts}</div>`;
  }
  renderModes(){
    const active=this.modeSession.state.mode;const cards=Object.entries(MODE_TARGETS).map(([mode,t])=>`<button class="mode-card ${active===mode?'selected':''}" data-mode="${mode}"><b>${mode==='Rescue'?'Chand Bazaar Rescue':mode==='Drone Delivery'?'Shapla Ghat Relay':mode}</b><span>🥉 ${t.bronze} · 🥈 ${t.silver} · 🥇 ${t.gold}</span><small>সেরা ${MEDAL[this.profile.data.modeMedals[mode]||'none']}</small></button>`).join('');
    const s=this.modeSession.state;const status=s.active?(s.mode==='Delivery'?`ডেলিভারি ${Math.floor(s.distance)}/${DELIVERY_RULES.distance}m · ${Math.round(s.integrity)}% স্থিতি · চেকপয়েন্ট ${s.checkpoints}/${Math.ceil(DELIVERY_RULES.distance/DELIVERY_RULES.checkpointDistance)} · ${Math.max(0,Math.ceil(DELIVERY_RULES.timeLimit-s.elapsed))}s`:s.mode==='Rescue'?`রেসকিউ ${Math.floor(s.distance)}/${RESCUE_RULES.distance}m · পার্সেল ${s.rescued}/${RESCUE_RULES.pickupDistances.length} · স্থিতি ${Math.round(s.integrity)}% · ${Math.max(0,Math.ceil(RESCUE_RULES.timeLimit-s.elapsed))}s`:s.mode==='Drone Delivery'?`Relay ${Math.floor(s.distance)}/${RELAY_RULES.distance}m · ${s.relaysActivated}/${RELAY_RULES.relayDistances.length} active · Kit ${Math.round(s.integrity)}% · ${Math.max(0,Math.ceil(RELAY_RULES.timeLimit-s.elapsed))}s`:s.mode==='Escape'?`Heat ${s.heat}/3`:`${Math.floor(s.elapsed)}s · score ${s.score}`):(s.lastResult?modeResultText(s.lastResult):'কোনো মোড চলছে না');
    const stopLabel=s.mode==='Delivery'?'ডেলিভারি বাতিল':s.mode==='Rescue'?'রেসকিউ বাতিল':s.mode==='Drone Delivery'?'রিলে রান বাতিল':'Prototype run শেষ করো';
    const objective=s.mode==='Rescue'?`Chand Bazaar Rescue: ${RESCUE_RULES.pickupDistances.length}টি পার্সেল তুলুন, রাস্তার চিহ্নিত লেন ধরে ${RESCUE_RULES.distance} মিটারের drop-off-এ পৌঁছান। অন্তত ${RESCUE_RULES.minimumRescues}টি পার্সেল নিয়ে ${RESCUE_RULES.timeLimit} সেকেন্ডের মধ্যে শেষ করুন।`:s.mode==='Delivery'?`Delivery: ${DELIVERY_RULES.distance} মিটার গন্তব্যে পৌঁছান, কার্গো স্থিতি ধরে রাখুন; ${DELIVERY_RULES.timeLimit} সেকেন্ডে অন্তত ${DELIVERY_RULES.minimumDistance} মিটার পৌঁছালে রান সম্পন্ন।`:s.mode==='Drone Delivery'?`Shapla Ghat Relay: ${RELAY_RULES.relayDistances.length}টি relay checkpoint সক্রিয় করে ${RELAY_RULES.distance} মিটারে পৌঁছান; অন্তত ${RELAY_RULES.minimumRelays}টি লিংক চালু রাখুন।`: 'এই প্রোটোটাইপে অন্য মোডগুলোর objective/রেজাল্ট এখনো সম্পূর্ণ নয়।';
    this.content.innerHTML=`<details class="character-tip" data-tip="modes" ${this.tipOpen?.modes?'open':''}><summary>চা-দোকানির পরামর্শ / Tea seller’s tip</summary><p>একটি মোড বাছুন, নির্দেশনা পড়ে গন্তব্যের দিকে যান। চলতি Delivery, Rescue বা Relay বাতিল করলে পুরস্কার মেলে না।</p><p lang="en">Choose a mode, read its objective and drive toward the destination. Cancelling Delivery, Rescue or Relay gives no reward.</p></details><p class="prototype-note">${objective}</p><div class="mode-list">${cards}</div><div class="mode-status">${status}</div><button class="mode-stop" data-finish ${s.active?'':'disabled'}>${stopLabel}</button>`;
  }
  handleClick(event){
    const vehicle=event.target.closest('[data-vehicle]')?.dataset.vehicle;if(vehicle){const item=VEHICLES.find(v=>v.id===vehicle);if(!item)return;if(this.profile.data.unlockedVehicles.includes(vehicle)){this.profile.selectVehicle(vehicle);EventBus.emit('vehicleChanged',{id:vehicle,color:item.color});}else if(this.profile.unlockVehicle(vehicle)){EventBus.emit('vehicleChanged',{id:vehicle,color:item.color});}this.render();return;}
    const upgrade=event.target.closest('[data-upgrade]')?.dataset.upgrade;if(upgrade){const item=UPGRADES.find(row=>row.id===upgrade);const level=this.profile.data.vehicleUpgrades[upgrade]||0;if(item&&this.profile.purchase(upgrade))EventBus.emit('upgradePurchased',{upgrade,level:level+1});this.render();return;}
    const contract=event.target.closest('[data-contract]')?.dataset.contract;if(contract){const item=CONTRACTS.find(c=>c.id===contract);if(item&&this.profile.claimContract(item.id))EventBus.emit('contractClaimed',{id:item.id,reward:item.reward});this.render();return;}
    const livery=event.target.closest('[data-livery]')?.dataset.livery;if(livery){if(this.profile.setLivery(livery))EventBus.emit('liveryChanged',{id:livery});this.render();return;}
    const mode=event.target.closest('[data-mode]')?.dataset.mode;if(mode){EventBus.emit('modeSelected',{mode});this.render();return;}
    if(event.target.closest('[data-finish]')){if(['Delivery','Rescue','Drone Delivery'].includes(this.modeSession.state.mode))this.modeSession.cancel('user-abort');else this.modeSession.finish();this.render();}
  }
  dispose(){this.unsubs.forEach(off=>off());this.root.replaceChildren();}
}
