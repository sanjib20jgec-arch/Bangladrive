import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { EventBus } from './core/EventBus.js';
import { ComboSystem } from './core/ComboSystem.js';
import { ProfileManager } from './core/ProfileManager.js';
import { ModeSession } from './core/ModeSession.js';
import { GhostSystem } from './core/GhostSystem.js';
import { NativeBridge } from './native/NativeBridge.js';
import { GarageUI } from './ui/GarageUI.js';
import { QualityManager } from './render/QualityManager.js';
import { VFXSystem } from './render/VFXSystem.js';
import { DriftController } from './vehicles/DriftController.js';
import { surfaceAt } from './physics/SurfaceGrip.js';
import { NearMissSystem } from './entities/NearMissSystem.js';
import { DestructiblePropPool } from './entities/DestructiblePropPool.js';
import { BossBapi } from './entities/BossBapi.js';
import { CommentaryDirector } from './audio/CommentaryDirector.js';
import { NavigationChevrons } from './world/NavigationChevrons.js';
import { buildWorld } from './world/WorldBuilder.js';
import './styles/game.css';

const $ = (s) => document.querySelector(s);
const canvas = $('#game-canvas'), hud = $('#hud-root'), ui = $('#ui-root');
const errorBox = $('#fatal-error');
const fail = (error) => { errorBox.classList.remove('hidden'); errorBox.textContent = `গেম চালু করা যায়নি\n${error?.stack || error}`; $('#boot-screen')?.classList.add('hidden'); };

async function boot() {
  const nativeBridge=new NativeBridge();await nativeBridge.initialize();
  await RAPIER.init(); window.RAPIER = RAPIER;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#9ab8c9'); scene.fog = new THREE.Fog('#9ab8c9', 90, 280);
  const camera = new THREE.PerspectiveCamera(66, innerWidth/innerHeight,.1,500);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !/Android/i.test(navigator.userAgent), powerPreference:'high-performance', alpha:false });
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
  const quality = new QualityManager(renderer); renderer.shadowMap.enabled = !/Android/i.test(navigator.userAgent); renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene.add(new THREE.HemisphereLight('#d6e7ff','#584b3d',2.1)); const sun=new THREE.DirectionalLight('#ffe0ae',2.8); sun.position.set(-25,45,18); sun.castShadow=renderer.shadowMap.enabled; sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;scene.add(sun);
  const mobileDevice=/Android|iPhone|iPad/i.test(navigator.userAgent);const applyQualityTier=tier=>{renderer.shadowMap.enabled=tier==='high'||tier==='ultra'||(!mobileDevice&&tier==='medium');sun.castShadow=renderer.shadowMap.enabled;const size=tier==='ultra'?2048:tier==='high'?1024:tier==='medium'?512:256;if(sun.shadow.map&&(sun.shadow.mapSize.x!==size||sun.shadow.mapSize.y!==size)){sun.shadow.map.dispose();sun.shadow.map=null;}sun.shadow.mapSize.set(size,size);sun.shadow.needsUpdate=true;};EventBus.on('qualityTierChanged',({tier})=>applyQualityTier(tier));applyQualityTier(quality.tier);
  const physics = new RAPIER.World({x:0,y:-9.81,z:0}); physics.timestep=1/60;
  const built = buildWorld(scene,physics);
  const props = new DestructiblePropPool(scene,64);
  const boss = new BossBapi(scene,-145);
  const chevrons = new NavigationChevrons(scene,10);
  const vfx = new VFXSystem(scene);
  const profile = new ProfileManager(); const modeSession = new ModeSession(profile);quality.setMode(profile.data.settings.quality||'auto');
  const car = new THREE.Group(); const paint = new THREE.MeshStandardMaterial({color:profile.data.selectedVehicle==='holud-taxi'?'#dcae24':profile.data.selectedVehicle==='tin-chaka'?'#439e77':profile.data.selectedVehicle==='drift-coupe'?'#ca5541':'#678baa',metalness:.42,roughness:.3}); const glass=new THREE.MeshStandardMaterial({color:'#7292a2',metalness:.2,roughness:.18});
  const hull=new THREE.Mesh(new THREE.BoxGeometry(1.9,.62,3.8),paint); hull.position.y=.55;hull.castShadow=true;car.add(hull);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.62,1.8),glass);cabin.position.set(0,1.08,-.15);cabin.castShadow=true;car.add(cabin);
  const wheelGeo=new THREE.CylinderGeometry(.38,.38,.26,12); const wheelMat=new THREE.MeshStandardMaterial({color:'#202124',roughness:.95});
  for(const x of [-.95,.95])for(const z of [-1.25,1.25]){const w=new THREE.Mesh(wheelGeo,wheelMat);w.rotation.z=Math.PI/2;w.position.set(x,.28,z);car.add(w);}
  scene.add(car);const ghost=new GhostSystem(scene,car);
  const body=physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0,1.1,8));
  physics.createCollider(RAPIER.ColliderDesc.cuboid(.86,.48,1.75).setFriction(.9).setRestitution(.03),body);
  const state={x:0,y:1.1,z:8,vx:0,vy:0,vz:0,yaw:0,speed:0,nitro:100+(profile.data.vehicleUpgrades.nitroTank||0)*12,nitroCap:100+(profile.data.vehicleUpgrades.nitroTank||0)*12,style:0,air:0,handbrake:false,boost:1,steer:0,throttle:0,brake:0};
  const vfxState={x:0,yaw:0,z:0,speed:0,drifting:false,handbrake:false,nitro:false,tier:0};
  const haptic=pattern=>{if(profile.data.settings.haptics){if(nativeBridge.native)nativeBridge.haptic(pattern);else navigator.vibrate?.(pattern);}};
  const vec={x:0,y:0,z:0}; const quat={x:0,y:0,z:0,w:1}; const drift=new DriftController(), nearMiss=new NearMissSystem(), combo=new ComboSystem();
  const garageUI=new GarageUI($('#menu-root'),profile,modeSession);
  hud.innerHTML='<div class="hud-top"><div class="brand">DESI OVERDRIVE<br><small>ঢাকা-কলকাতা ড্রিফট</small></div><div class="meters"><div class="speed"><strong id="speed">0</strong> km/h</div><div class="combo" id="combo">1× · প্রস্তুত</div></div></div><div class="mode-status-hud" id="mode-status-hud"></div><div class="commentary" id="commentary"></div><div class="mobile-controls"><div class="steering"><button class="control" data-input="left" data-value="-1">◀</button><button class="control" data-input="right" data-value="1">▶</button></div><div class="joystick-wrap hidden" id="joystick-wrap"><div class="joystick-base" id="joystick-base"><div class="joystick-knob" id="joystick-knob"></div></div></div><div class="pedals"><button class="control horn" data-action="horn">HORN</button><button class="control" data-input="handbrake" data-value="1">DRIFT</button><button class="control" data-input="nitro" data-value="1">N₂O</button><div><button class="control" data-input="brake" data-value="1">BRAKE</button><button class="control gas" data-input="throttle" data-value="1">GO</button></div></div></div>';
  const commentary=new CommentaryDirector($('#commentary'),nativeBridge);
  const settings=document.createElement('div');settings.className='settings';settings.innerHTML='<button id="settings-toggle">⚙</button><div id="settings-panel" class="hidden"><label>Graphics <select id="quality-choice"><option value="auto">Auto</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="ultra">Ultra</option></select></label><label>Touch <select id="control-mode-choice"><option value="split">Split buttons</option><option value="joystick">Joystick</option></select></label><label><input id="drift-assist-choice" type="checkbox"> Auto-drift assist</label><label><input id="haptics-choice" type="checkbox"> Haptics</label><p>৳ <span id="taka">0</span> · 7 prototype modes</p></div>';ui.append(settings);
  $('#quality-choice').value=profile.data.settings.quality||'auto';$('#quality-choice').addEventListener('change',e=>{quality.setMode(e.target.value);profile.setSetting('quality',e.target.value);});
  $('#settings-toggle').addEventListener('click',()=>$('#settings-panel').classList.toggle('hidden'));
  const controlsChoice=$('#control-mode-choice');controlsChoice.value=profile.data.settings.controls||'split';const syncControls=()=>{const joystick=controlsChoice.value==='joystick';$('.steering').classList.toggle('hidden',joystick);$('#joystick-wrap').classList.toggle('hidden',!joystick);};syncControls();controlsChoice.addEventListener('change',()=>{profile.setSetting('controls',controlsChoice.value);syncControls();});
  const driftAssistChoice=$('#drift-assist-choice');driftAssistChoice.checked=!!profile.data.settings.driftAssist;driftAssistChoice.addEventListener('change',()=>profile.setSetting('driftAssist',driftAssistChoice.checked));
  const hapticsChoice=$('#haptics-choice');hapticsChoice.checked=profile.data.settings.haptics!==false;hapticsChoice.addEventListener('change',()=>profile.setSetting('haptics',hapticsChoice.checked));
  const input={}; const onKey=(e,down)=>{const map={KeyW:['throttle',1],ArrowUp:['throttle',1],KeyS:['brake',1],ArrowDown:['brake',1],KeyA:['left',-1],ArrowLeft:['left',-1],KeyD:['right',1],ArrowRight:['right',1],Space:['handbrake',1],ShiftLeft:['nitro',1],KeyE:['horn',1]};const binding=map[e.code];if(binding){const [k,value]=binding;input[k]=down?value:0;e.preventDefault();}};
  addEventListener('keydown',e=>onKey(e,true));addEventListener('keyup',e=>onKey(e,false));
  for(const button of document.querySelectorAll('[data-input]')){const key=button.dataset.input,value=Number(button.dataset.value);const start=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('active');input[key]=value;};const stop=e=>{if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);button.classList.remove('active');input[key]=0;};button.addEventListener('pointerdown',start);button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);button.addEventListener('lostpointercapture',()=>{button.classList.remove('active');input[key]=0;});}
  const joystickBase=$('#joystick-base'),joystickKnob=$('#joystick-knob');let joystickPointer=-1;
  const moveJoystick=e=>{if(e.pointerId!==joystickPointer)return;const rect=joystickBase.getBoundingClientRect(),cx=rect.left+rect.width*.5,cy=rect.top+rect.height*.5,dx=e.clientX-cx,dy=e.clientY-cy,r=rect.width*.34,len=Math.hypot(dx,dy),scale=len>r?r/len:1,nx=dx*scale/r;input.left=Math.min(0,nx);input.right=Math.max(0,nx);joystickKnob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;};
  joystickBase.addEventListener('pointerdown',e=>{e.preventDefault();joystickPointer=e.pointerId;joystickBase.setPointerCapture(e.pointerId);moveJoystick(e);});
  joystickBase.addEventListener('pointermove',moveJoystick);const releaseJoystick=e=>{if(e.pointerId!==joystickPointer)return;joystickPointer=-1;input.left=input.right=0;joystickKnob.style.transform='translate(0,0)';};joystickBase.addEventListener('pointerup',releaseJoystick);joystickBase.addEventListener('pointercancel',releaseJoystick);joystickBase.addEventListener('lostpointercapture',releaseJoystick);
  for(const button of document.querySelectorAll('[data-action="horn"]'))button.addEventListener('pointerdown',()=>{EventBus.emit('hornPulse',{range:28});haptic(12);});
  addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat){EventBus.emit('hornPulse',{range:28});}});
  const actions={};const stylePopup=(text)=>{let e=$('#combo');e.textContent=text;e.classList.add('active');};
  EventBus.on('driftTier',({tier})=>{stylePopup(['','BLUE SPARK · TIER 1','ORANGE SPARK · TIER 2','BANGLA OVERDRIVE · TIER 3'][tier]);});
  EventBus.on('driftBoost',({tier,nitro})=>{state.nitro=Math.min(state.nitroCap,state.nitro+nitro);state.boost=[1,1.15,1.3,1.5][tier];setTimeout(()=>state.boost=1,[0,800,1300,2000][tier]);haptic(tier===3?[25,30,50]:18);});
  EventBus.on('nearMiss',()=>{haptic(20);state.style+=150;state.nitro=Math.min(state.nitroCap,state.nitro+12);profile.addTaka(5);EventBus.emit('styleAction',{points:150});stylePopup('BAPRE BAAP! NEAR MISS!');});
  EventBus.on('chaosGain',({points=75}={})=>{state.style+=points;profile.addTaka(8);EventBus.emit('styleAction',{points});haptic(14);stylePopup('BAZAAR CHAOS! +75');});
  EventBus.on('bossPhase',({label})=>{stylePopup(label);haptic(25);});
  EventBus.on('bossTelegraph',()=>stylePopup('BAPI SHOCKWAVE! DODGE!'));
  EventBus.on('bossDefeated',({reward})=>{profile.addTaka(reward);stylePopup(`BAPI DOWN! +৳${reward}`);});
  EventBus.on('bossHazardNear',()=>EventBus.emit('styleAction',{points:100}));
  EventBus.on('chaosGain',()=>modeSession.damage(5));
  EventBus.on('modeResult',({medal})=>{const reward=medal==='gold'?350:medal==='silver'?180:medal==='bronze'?80:0;if(reward)profile.addTaka(reward);EventBus.emit(medal==='none'?'missionFail':'missionWin');stylePopup(medal==='none'?'আরও একটু চেষ্টা!':`${medal.toUpperCase()} MEDAL · +৳${reward}`);});
  EventBus.on('vehicleChanged',({color})=>{if(color)paint.color.set(color);});
  EventBus.on('upgradePurchased',({upgrade})=>{if(upgrade==='nitroTank'){state.nitroCap+=12;state.nitro=Math.min(state.nitroCap,state.nitro+12);}});
  EventBus.on('liveryChanged',({id})=>{paint.color.set(id==='cream'?'#ddd3ba':id==='green'?'#7c9b68':'#dcae24');});
  EventBus.on('hornPulse',()=>{const now=performance.now();for(const actor of built.actors){const dx=actor.x-state.x,dz=actor.z-state.z;if(dz<0&&-dz<28&&Math.abs(dx)<-dz*.54){if(actor.type==='cow'){if(actor.netaji&&Math.hypot(dx,dz)<10)actor.chargeUntil=now+1300;else actor.scatterUntil=now+1700;}else actor.yieldUntil=now+1800;}}});
  EventBus.on('comboChanged',snapshot=>{const e=$('#combo'); if(!e.classList.contains('active'))e.textContent=`${snapshot.multiplier}× ${snapshot.label||'STYLE'} · ${snapshot.points}`; if(snapshot.multiplier===5)$('#edge-glow').classList.add('overdrive');else $('#edge-glow').classList.remove('overdrive');});
  const fixed=1/60;let accumulator=0,last=performance.now(),fpsElapsed=0,frames=0;let previousSlip=0,nitroWasActive=false;
  const updateActors=(dt)=>{const now=performance.now();for(const actor of built.actors){if(actor.type==='traffic'&&actor.yieldUntil>now){actor.x+=(actor.x>state.x?1:-1)*dt*1.8;actor.mesh.position.x=actor.x;}else if(actor.type==='cow'){if(actor.scatterUntil>now){actor.x+=(actor.x>=0?1:-1)*dt*2.1;actor.mesh.position.x=actor.x;}else if(actor.chargeUntil>now){actor.x+=(state.x>actor.x?1:-1)*dt*2.4;actor.z+=dt*3;actor.mesh.position.set(actor.x,.9,actor.z);}}}nearMiss.update(dt,state,built.actors,state.speed*3.6);};
  const fixedUpdate=(dt)=>{
    const upgrades=profile.data.vehicleUpgrades;const grip=surfaceAt(state.x,state.z)*(1+(upgrades.driftTires||0)*.04); const steer=Number(input.left||0)+Number(input.right||0);const maxSpeed=(input.nitro?48:34)+(upgrades.engine||0)*1.5;const speedNorm=Math.min(1,Math.abs(state.speed)/maxSpeed);const steerFactor=1-.58*speedNorm;
    state.steer += (steer*steerFactor-state.steer)*Math.min(1,dt*8);const autoDrift=profile.data.settings.driftAssist&&Math.abs(state.speed)>12&&Math.abs(state.steer)>.82;state.handbrake=!!input.handbrake||autoDrift;
    const accel=Number(input.throttle||0)*18*state.boost*(1+(upgrades.engine||0)*.05)-(Number(input.brake||0)*22); state.speed+=accel*dt;state.speed*=Math.pow(input.handbrake?.985:.994,dt*60);state.speed=Math.max(-7,Math.min(maxSpeed,state.speed));
    const nitroActive=!!input.nitro&&state.nitro>0;if(nitroActive&&!nitroWasActive){EventBus.emit('nitro');haptic(10);}nitroWasActive=nitroActive;if(nitroActive){state.speed=Math.min(48,state.speed+12*dt);state.nitro=Math.max(0,state.nitro-18*dt);}
    const oldVx=state.vx,oldVz=state.vz;state.yaw+=state.steer*(.45+Math.abs(state.speed)/14)*dt*(Math.sign(state.speed)||1);
    const fx=Math.sin(state.yaw),fz=-Math.cos(state.yaw);const targetVx=fx*state.speed,targetVz=fz*state.speed;const lateral=Math.hypot(oldVx-targetVx,oldVz-targetVz);const result=drift.update(dt,lateral,state.speed,state.handbrake);
    const lateralGrip=Math.min(1,grip*(state.handbrake?.34:.86));const response=Math.min(1,dt*(result?2.4:6.5)*lateralGrip);state.vx+=(targetVx-state.vx)*response;state.vz+=(targetVz-state.vz)*response;
    state.x+=state.vx*dt;state.z+=state.vz*dt;
    if(state.x>9||state.x< -9){state.x=Math.max(-9,Math.min(9,state.x));state.speed*=Math.min(.999,.97+(profile.data.vehicleUpgrades.bumper||0)*.006);state.vx*=-.25;EventBus.emit('styleAction',{points:50});}
    if(state.z>60){state.z=-360;}
    vec.x=state.x;vec.y=1.1;vec.z=state.z;body.setNextKinematicTranslation(vec);quat.x=0;quat.y=Math.sin(state.yaw*.5);quat.z=0;quat.w=Math.cos(state.yaw*.5);body.setNextKinematicRotation(quat);physics.step();
    state.speed=Math.hypot(state.vx,state.vz);state.speedKmh=Math.round(state.speed*3.6);state.drifting=result;
    vfxState.x=state.x;vfxState.yaw=state.yaw;vfxState.z=state.z;vfxState.speed=state.speed;vfxState.drifting=result;vfxState.handbrake=state.handbrake;vfxState.nitro=!!input.nitro&&state.nitro>0;vfxState.tier=drift.tier;vfx.update(dt,vfxState);
    if(result&&!previousSlip){EventBus.emit('styleAction',{points:100});}previousSlip=result;
    updateActors(dt);props.hitTest(state.x,state.z,state.speed);props.update(dt,state.z);boss.update(dt,state);chevrons.update(dt,state.x,state.z);combo.update(dt);modeSession.update(dt,state);ghost.update(dt,state);commentary.update(dt);
  };
  const cameraPos=new THREE.Vector3(),lookAt=new THREE.Vector3();let renderNow=0;
  function frame(now){requestAnimationFrame(frame);const delta=Math.min(.05,(now-last)/1000);last=now;accumulator+=delta;while(accumulator>=fixed){fixedUpdate(fixed);accumulator-=fixed;}renderNow=now;
    car.position.set(state.x,state.y,state.z);car.rotation.y=state.yaw;car.rotation.z=state.steer*state.speed*.008*(1-(profile.data.vehicleUpgrades.suspension||0)*.08)*(state.drifting?1.4:.7);
    cameraPos.set(state.x+Math.sin(state.yaw)*9,5.5,state.z+Math.cos(state.yaw)*9);camera.position.lerp(cameraPos,.12);lookAt.set(state.x,1.0,state.z-4);camera.lookAt(lookAt);
    $('#speed').textContent=String(state.speedKmh||0);const speedEl=$('.speed');if(speedEl)speedEl.style.borderBottom=`3px solid hsl(${Math.max(0,120-(state.speedKmh||0)*1.5)},85%,52%)`;
    quality.sample(delta*1000,delta);frames++;fpsElapsed+=delta;if(fpsElapsed>1){renderer.render(scene,camera);fpsElapsed=0;frames=0;}else renderer.render(scene,camera);
    if(now%500<20){$('#taka').textContent=profile.data.taka;const modeHud=$('#mode-status-hud'),ms=modeSession.state;if(ms.active){modeHud.textContent=ms.mode==='Escape'?`ESCAPE · HEAT ${ms.heat}/3`:ms.mode==='Delivery'?`DELIVERY · STABILITY ${Math.round(ms.integrity)}% · ${Math.floor(ms.score)}m`:`${ms.mode.toUpperCase()} · ${Math.floor(ms.elapsed)}s · ${Math.floor(ms.score)}`;}else modeHud.textContent='';}
  }
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);}addEventListener('resize',resize,{passive:true});resize();
  $('#boot-screen').style.opacity='0';setTimeout(()=>$('#boot-screen').remove(),550);requestAnimationFrame(frame);
  document.addEventListener('visibilitychange',()=>{last=performance.now();accumulator=0;});
  document.addEventListener('nativeAppState',()=>{last=performance.now();accumulator=0;});
  nativeBridge.setBackHandler(()=>{if(garageUI.open){garageUI.setOpen(false);return;}if(!$('#settings-panel').classList.contains('hidden')){$('#settings-panel').classList.add('hidden');return;}if(modeSession.state.active){modeSession.finish();return;}if(globalThis.confirm('Exit Game? (হ্যাঁ / না)'))nativeBridge.exitApp();});
  addEventListener('pagehide',()=>{nativeBridge.dispose();ghost.dispose();vfx.dispose();});
  window.__gameDebug={scene,renderer,physics,quality,profile,state,drift,combo,ghost,modeSession,actors:built.actors};
}
boot().catch(fail);
