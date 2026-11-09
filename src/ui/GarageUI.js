import { EventBus } from '../core/EventBus.js';
import { MODE_TARGETS } from '../core/ModeTargets.js';

const VEHICLES=[
  {id:'holud-taxi',name:'Holud Taxi',color:'#dcae24',cost:0},
  {id:'tin-chaka',name:'Tin-Chaka Rocket Auto',color:'#439e77',cost:900},
  {id:'drift-coupe',name:'Drift Coupe',color:'#ca5541',cost:1500},
  {id:'machh-van',name:'Machh-er Van',color:'#678baa',cost:1200},
];
const UPGRADES=[['engine','Engine',250],['driftTires','Drift Tires',220],['nitroTank','Nitro Tank',200],['bumper','Desi Bumper',180],['suspension','Suspension',240]];
const CONTRACTS=[{id:'near-miss',title:'চুল-চেরা পাস ×3',target:3,reward:180},{id:'drift',title:'ড্রিফট টিয়ার ×3',target:3,reward:220},{id:'chaos',title:'বাজারে কাণ্ড ×4',target:4,reward:200}];
const MEDAL={none:'—',bronze:'🥉',silver:'🥈',gold:'🥇'};

export class GarageUI {
  constructor(root,profile,modeSession){this.root=root;this.profile=profile;this.modeSession=modeSession;this.tab='garage';this.open=false;this.unsubs=[];this.mount();this.listen();this.render();}
  mount(){this.root.innerHTML='<button class="garage-launch" id="garage-launch">GARAGE · CHA-STAL</button><section class="garage-overlay hidden" id="garage-overlay"><header><div><b>Bapi’r Garage & Cha-Stall</b><small>টাকা, টিউনিং আর আজকের খেপ</small></div><button id="garage-close" aria-label="Close">✕</button></header><nav class="garage-tabs"><button data-tab="garage">গ্যারেজ</button><button data-tab="modes">মোড ও মেডেল</button></nav><div id="garage-content" class="garage-content"></div></section>';
    this.overlay=this.root.querySelector('#garage-overlay');this.content=this.root.querySelector('#garage-content');
    this.root.querySelector('#garage-launch').addEventListener('click',()=>this.setOpen(!this.open));this.root.querySelector('#garage-close').addEventListener('click',()=>this.setOpen(false));
    this.root.querySelector('.garage-tabs').addEventListener('click',e=>{const tab=e.target.closest('[data-tab]')?.dataset.tab;if(tab){this.tab=tab;this.render();}});
    this.content.addEventListener('click',e=>this.handleClick(e));
  }
  listen(){
    this.unsubs.push(EventBus.on('nearMiss',()=>{this.profile.progressContract('near-miss');if(this.open)this.render();}));
    this.unsubs.push(EventBus.on('driftTier',()=>{this.profile.progressContract('drift');if(this.open)this.render();}));
    this.unsubs.push(EventBus.on('chaosGain',()=>{this.profile.progressContract('chaos');if(this.open)this.render();}));
    this.unsubs.push(EventBus.on('profileChanged',()=>{if(this.open)this.render();}));
    this.unsubs.push(EventBus.on('modeResult',()=>this.render()));
    this.unsubs.push(EventBus.on('modeStarted',()=>this.render()));
  }
  setOpen(open){this.open=open;this.overlay.classList.toggle('hidden',!open);if(open)this.render();}
  render(){
    if(!this.content)return;
    this.root.querySelectorAll('.garage-tabs [data-tab]').forEach(button=>button.classList.toggle('selected',button.dataset.tab===this.tab));
    if(this.tab==='garage')this.renderGarage();else this.renderModes();
  }
  renderGarage(){
    const p=this.profile.data;const vehicles=VEHICLES.map(v=>{const unlocked=p.unlockedVehicles.includes(v.id);const selected=p.selectedVehicle===v.id;return `<article class="vehicle-card ${selected?'selected':''}"><i style="--vehicle:${v.color}"></i><div><b>${v.name}</b><small>${unlocked?(selected?'নির্বাচিত':'আনলক করা'):`৳${v.cost} দিয়ে আনলক`}</small></div><button data-vehicle="${v.id}" ${selected?'disabled':''}>${unlocked?'বাছুন':`৳${v.cost}`}</button></article>`;}).join('');
    const upgrades=UPGRADES.map(([id,label,base])=>{const level=p.vehicleUpgrades[id]||0;const cost=base*(level+1);return `<div class="upgrade-row"><span>${label}<small>Tier ${level}/5</small></span><button data-upgrade="${id}" ${level>=5?'disabled':''}>${level>=5?'MAX':`৳${cost} · +1`}</button></div>`;}).join('');
    const contracts=CONTRACTS.map(c=>{const progress=Math.min(c.target,p.daily.progress[c.id]||0);const claimed=!!p.daily.claimed[c.id];return `<div class="contract-row"><span>${c.title}<small>${progress}/${c.target} · পুরস্কার ৳${c.reward}</small></span><button data-contract="${c.id}" ${claimed||progress<c.target?'disabled':''}>${claimed?'নেওয়া হয়েছে':'নাও'}</button></div>`;}).join('');
    const liveries=[['holud','হলুদ'],['cream','ক্রিম'],['green','সবুজ']].map(([id,name])=>`<button class="livery ${p.selectedLivery===id?'selected':''}" data-livery="${id}">${name}</button>`).join('');
    this.content.innerHTML=`<div class="garage-balance">বর্তমান ব্যালান্স <strong>৳${p.taka}</strong></div><h3>গাড়ি বাছুন</h3><div class="vehicle-list">${vehicles}</div><h3>টিউন-আপ</h3><div>${upgrades}</div><h3>লিভারি</h3><div class="livery-list">${liveries}</div><h3>আজকের ৩ খেপ</h3><div>${contracts}</div>`;
  }
  renderModes(){
    const active=this.modeSession.state.mode;const cards=Object.entries(MODE_TARGETS).map(([mode,t])=>`<button class="mode-card ${active===mode?'selected':''}" data-mode="${mode}"><b>${mode}</b><span>🥉 ${t.bronze} · 🥈 ${t.silver} · 🥇 ${t.gold}</span><small>সেরা ${MEDAL[this.profile.data.modeMedals[mode]||'none']}</small></button>`).join('');
    const s=this.modeSession.state;const status=s.active?(s.mode==='Delivery'?`Jhol-spill stability ${Math.round(s.integrity)}%`:s.mode==='Escape'?`Heat ${s.heat}/3`:`${Math.floor(s.elapsed)}s · score ${s.score}`):'কোনো মোড চলছে না';
    this.content.innerHTML=`<p class="prototype-note">মিশন objective এখনো prototype নয়; এখানে mode নির্বাচন ও medal threshold দেখানো হচ্ছে।</p><div class="mode-list">${cards}</div><div class="mode-status">${status}</div><button class="mode-stop" data-finish ${s.active?'':'disabled'}>Prototype run শেষ করো</button>`;
  }
  handleClick(event){
    const vehicle=event.target.closest('[data-vehicle]')?.dataset.vehicle;if(vehicle){const item=VEHICLES.find(v=>v.id===vehicle);if(!item)return;if(this.profile.data.unlockedVehicles.includes(vehicle)){this.profile.selectVehicle(vehicle);EventBus.emit('vehicleChanged',{id:vehicle,color:item.color});}else if(this.profile.unlockVehicle(vehicle,item.cost)){EventBus.emit('vehicleChanged',{id:vehicle,color:item.color});}this.render();return;}
    const upgrade=event.target.closest('[data-upgrade]')?.dataset.upgrade;if(upgrade){const item=UPGRADES.find(row=>row[0]===upgrade);const level=this.profile.data.vehicleUpgrades[upgrade]||0;if(item&&this.profile.purchase(upgrade,item[2]*(level+1)))EventBus.emit('upgradePurchased',{upgrade,level:level+1});this.render();return;}
    const contract=event.target.closest('[data-contract]')?.dataset.contract;if(contract){const item=CONTRACTS.find(c=>c.id===contract);if(item&&this.profile.claimContract(item.id,item.target,item.reward))EventBus.emit('contractClaimed',{id:item.id,reward:item.reward});this.render();return;}
    const livery=event.target.closest('[data-livery]')?.dataset.livery;if(livery){this.profile.setLivery(livery);EventBus.emit('liveryChanged',{id:livery});this.render();return;}
    const mode=event.target.closest('[data-mode]')?.dataset.mode;if(mode){EventBus.emit('modeSelected',{mode});this.render();return;}
    if(event.target.closest('[data-finish]')){this.modeSession.finish();this.render();}
  }
  dispose(){this.unsubs.forEach(off=>off());this.root.replaceChildren();}
}
