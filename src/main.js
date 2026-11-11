import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { EventBus } from './core/EventBus.js';
import { ComboSystem } from './core/ComboSystem.js';
import { ProfileManager } from './core/ProfileManager.js';
import { ModeSession } from './core/ModeSession.js';
import { PauseState } from './core/PauseState.js';
import { DELIVERY_RULES, RELAY_RULES, RESCUE_RULES } from './core/ModeTargets.js';
import { GhostSystem } from './core/GhostSystem.js';
import { NativeBridge } from './native/NativeBridge.js';
import { GarageUI } from './ui/GarageUI.js';
import { modeResultText } from './ui/ModeResultText.js';
import { FirstDriveGuide } from './ui/FirstDriveGuide.js';
import { FirstDrivePracticeView } from './ui/FirstDrivePracticeView.js';
import { FirstDrivePractice } from './core/FirstDrivePractice.js';
import { QualityManager } from './render/QualityManager.js';
import { FrameDiagnostics } from './render/FrameDiagnostics.js';
import { FrameDiagnosticsUI } from './ui/FrameDiagnosticsUI.js';
import { ProfileSaveNotice } from './ui/ProfileSaveNotice.js';
import { ModeAnnouncements } from './ui/ModeAnnouncements.js';
import { ComboHud } from './ui/ComboHud.js';
import { VFXSystem } from './render/VFXSystem.js';
import { DriftController } from './vehicles/DriftController.js';
import { DrivingInput } from './vehicles/DrivingInput.js';
import { surfaceAt } from './physics/SurfaceGrip.js';
import { VehicleCollision } from './physics/VehicleCollision.js';
import { CollisionFeedback } from './physics/CollisionFeedback.js';
import { VehicleRecovery } from './physics/VehicleRecovery.js';
import { NearMissSystem } from './entities/NearMissSystem.js';
import { RoadActorMotion } from './entities/RoadActorMotion.js';
import { DestructiblePropPool } from './entities/DestructiblePropPool.js';
import { BossBapi } from './entities/BossBapi.js';
import { CommentaryDirector } from './audio/CommentaryDirector.js';
import { NavigationChevrons } from './world/NavigationChevrons.js';
import { buildWorld } from './world/WorldBuilder.js';
import { StageObjectiveMarkers } from './world/StageObjectiveMarkers.js';
import '@fontsource/noto-sans-bengali/bengali-400.css';
import '@fontsource/noto-sans-bengali/bengali-700.css';
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
  const props = new DestructiblePropPool(scene,96);
  const boss = new BossBapi(scene,-145);
  const chevrons = new NavigationChevrons(scene,10);
  const vfx = new VFXSystem(scene);
  const profile = new ProfileManager(); const modeSession = new ModeSession(profile);const objectiveMarkers=new StageObjectiveMarkers(scene);quality.setMode(profile.data.settings.quality||'auto');nativeBridge.setVoiceEnabled(profile.data.settings.voice);
  const car = new THREE.Group(); const paint = new THREE.MeshStandardMaterial({color:profile.data.selectedVehicle==='holud-taxi'?'#dcae24':profile.data.selectedVehicle==='tin-chaka'?'#439e77':profile.data.selectedVehicle==='drift-coupe'?'#ca5541':'#678baa',metalness:.42,roughness:.3}); const glass=new THREE.MeshStandardMaterial({color:'#7292a2',metalness:.2,roughness:.18});
  const hull=new THREE.Mesh(new THREE.BoxGeometry(1.9,.62,3.8),paint); hull.position.y=.55;hull.castShadow=true;car.add(hull);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.62,1.8),glass);cabin.position.set(0,1.08,-.15);cabin.castShadow=true;car.add(cabin);
  const wheelGeo=new THREE.CylinderGeometry(.38,.38,.26,12); const wheelMat=new THREE.MeshStandardMaterial({color:'#202124',roughness:.95});
  for(const x of [-.95,.95])for(const z of [-1.25,1.25]){const w=new THREE.Mesh(wheelGeo,wheelMat);w.rotation.z=Math.PI/2;w.position.set(x,.28,z);car.add(w);}
  scene.add(car);const ghost=new GhostSystem(scene,car);
  const body=physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0,1.1,8));
  const vehicleCollider=physics.createCollider(RAPIER.ColliderDesc.cuboid(.86,.48,1.75).setFriction(.9).setRestitution(.03),body);
  const vehicleCollision=new VehicleCollision(physics,vehicleCollider);
  physics.step(); // Populate Rapier's query pipeline before the first swept movement.
  const state={x:0,y:1.1,z:8,vx:0,vy:0,vz:0,yaw:0,speed:0,nitro:100+(profile.data.vehicleUpgrades.nitroTank||0)*12,nitroCap:100+(profile.data.vehicleUpgrades.nitroTank||0)*12,style:0,air:0,handbrake:false,boost:1,steer:0,throttle:0,brake:0};
  const vfxState={x:0,yaw:0,z:0,speed:0,drifting:false,handbrake:false,nitro:false,tier:0};
  const haptic=pattern=>{if(profile.data.settings.haptics){if(nativeBridge.native)nativeBridge.haptic(pattern);else navigator.vibrate?.(pattern);}};
  const vec={x:0,y:0,z:0}; const quat={x:0,y:0,z:0,w:1}; const drift=new DriftController(), nearMiss=new NearMissSystem(), combo=new ComboSystem();
  const garageUI=new GarageUI($('#menu-root'),profile,modeSession);
  hud.innerHTML='<div class="hud-top"><div class="brand">DESI OVERDRIVE<br><small>ঢাকা-কলকাতা ড্রিফট</small></div><div class="meters"><div class="speed"><strong id="speed">0</strong> km/h</div><div class="combo" id="combo">1× · প্রস্তুত</div></div></div><div class="mode-status-hud" id="mode-status-hud"></div><div class="commentary" id="commentary"></div><div id="collision-feedback" class="collision-feedback" role="status" aria-live="polite"></div><div class="mobile-controls"><div class="steering"><button class="control" aria-label="বামে চালান / Steer left" data-input="left" data-value="-1">◀</button><button class="control" aria-label="ডানে চালান / Steer right" data-input="right" data-value="1">▶</button></div><div class="joystick-wrap hidden" id="joystick-wrap"><div class="joystick-base" id="joystick-base"><div class="joystick-knob" id="joystick-knob"></div></div></div><div class="pedals"><button class="control horn" aria-label="হর্ন / Horn" data-action="horn">HORN</button><button class="control" aria-label="ড্রিফট / Handbrake" data-input="handbrake" data-value="1">DRIFT</button><button class="control" aria-label="নাইট্রো / Nitro" data-input="nitro" data-value="1">N₂O</button><div><button class="control" aria-label="ব্রেক / Brake" data-input="brake" data-value="1">BRAKE</button><button class="control gas" aria-label="গতি বাড়ান / Accelerate" data-input="throttle" data-value="1">GO</button></div></div></div>';
  const modeAnnouncementRoot=document.createElement('div');modeAnnouncementRoot.id='mode-announcement';modeAnnouncementRoot.className='sr-only';hud.append(modeAnnouncementRoot);new ModeAnnouncements(modeAnnouncementRoot);
  const commentary=new CommentaryDirector($('#commentary'),nativeBridge);
  let guideStorage;try{guideStorage=globalThis.localStorage;}catch{/* private or denied storage: guide stays optional */}
  const guideRoot=document.createElement('div');ui.append(guideRoot);const firstDriveGuide=new FirstDriveGuide(guideRoot,guideStorage,()=>canvas.focus({preventScroll:true}));
  const settings=document.createElement('div');settings.className='settings';settings.innerHTML='<button id="settings-toggle" aria-label="সেটিংস / Settings">⚙</button><div id="settings-panel" class="hidden"><label>Graphics <select id="quality-choice"><option value="auto">Auto</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="ultra">Ultra</option></select></label><label>HUD লেখা / HUD text <select id="hud-size-choice"><option value="standard">Standard</option><option value="large">Large</option></select></label><label>মোশন / Motion <select id="motion-choice"><option value="system">System</option><option value="reduced">Reduced</option><option value="standard">Standard</option></select></label><label>Touch <select id="control-mode-choice"><option value="split">Split buttons</option><option value="joystick">Joystick</option></select></label><label class="toggle-setting"><input id="drift-assist-choice" type="checkbox"> Auto-drift assist</label><label class="toggle-setting"><input id="haptics-choice" type="checkbox"> Haptics</label><label class="toggle-setting"><input id="voice-choice" type="checkbox"> কণ্ঠস্বর / Voice commentary</label><button id="pause-game" type="button">বিরতি / Pause</button><button id="show-first-drive-guide" type="button">প্রথম চালনার নির্দেশনা / First drive guide</button><details class="recovery-help"><summary>গাড়ি ফেরান / Recover vehicle</summary><p>নিরাপদ জায়গায় ফিরে যাবে। চলতি run বাতিল হবে; কোনো mission reward মিলবে না। / Return to a clear spot and cancel the active run without a mission reward.</p><button id="recover-vehicle">গাড়ি ফেরান / Recover</button><p id="recovery-status" role="status" aria-live="polite"></p></details><p>৳ <span id="taka">0</span> · 7 prototype modes</p></div>';ui.append(settings);
  const saveNoticeRoot=document.createElement('div');hud.append(saveNoticeRoot);new ProfileSaveNotice(saveNoticeRoot,$('#settings-panel'),profile,nativeBridge.profileMirror);
  const frameDiagnostics=new FrameDiagnostics();const diagnosticsRoot=document.createElement('div');$('#settings-panel').append(diagnosticsRoot);new FrameDiagnosticsUI(diagnosticsRoot,frameDiagnostics,renderer,quality);
  $('#quality-choice').value=profile.data.settings.quality||'auto';$('#quality-choice').addEventListener('change',e=>{quality.setMode(e.target.value);profile.setSetting('quality',e.target.value);});
  $('#settings-toggle').addEventListener('click',()=>{const panel=$('#settings-panel');panel.classList.toggle('hidden');if(panel.classList.contains('hidden'))canvas.focus({preventScroll:true});});
  $('#show-first-drive-guide').addEventListener('click',()=>{firstDriveGuide.show();$('#settings-panel').classList.add('hidden');canvas.focus({preventScroll:true});});
  const hudSizeChoice=$('#hud-size-choice');hudSizeChoice.value=profile.data.settings.hudSize;const syncHudSize=()=>{hud.dataset.hudSize=hudSizeChoice.value;document.documentElement.dataset.hudSize=hudSizeChoice.value;};syncHudSize();hudSizeChoice.addEventListener('change',()=>{profile.setSetting('hudSize',hudSizeChoice.value);syncHudSize();});
  const motionChoice=$('#motion-choice'),motionQuery=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');let reducedMotion=false;motionChoice.value=profile.data.settings.motion;const syncMotion=()=>{reducedMotion=motionChoice.value==='reduced'||(motionChoice.value==='system'&&!!motionQuery?.matches);document.documentElement.dataset.reducedMotion=String(reducedMotion);vfx.setReducedMotion(reducedMotion);};syncMotion();motionChoice.addEventListener('change',()=>{profile.setSetting('motion',motionChoice.value);syncMotion();});motionQuery?.addEventListener?.('change',syncMotion);
  const controlsChoice=$('#control-mode-choice');controlsChoice.value=profile.data.settings.controls||'split';const syncControls=()=>{const joystick=controlsChoice.value==='joystick';$('.steering').classList.toggle('hidden',joystick);$('#joystick-wrap').classList.toggle('hidden',!joystick);};syncControls();controlsChoice.addEventListener('change',()=>{profile.setSetting('controls',controlsChoice.value);syncControls();});
  const driftAssistChoice=$('#drift-assist-choice');driftAssistChoice.checked=!!profile.data.settings.driftAssist;driftAssistChoice.addEventListener('change',()=>profile.setSetting('driftAssist',driftAssistChoice.checked));
  const hapticsChoice=$('#haptics-choice');hapticsChoice.checked=profile.data.settings.haptics!==false;hapticsChoice.addEventListener('change',()=>profile.setSetting('haptics',hapticsChoice.checked));
  const voiceChoice=$('#voice-choice');voiceChoice.checked=profile.data.settings.voice;voiceChoice.addEventListener('change',()=>{profile.setSetting('voice',voiceChoice.checked);nativeBridge.setVoiceEnabled(voiceChoice.checked);});
  const pauseState=new PauseState();pauseState.pageVisible=!document.hidden;
  const pauseRoot=document.createElement('div');ui.append(pauseRoot);pauseRoot.innerHTML='<section id="pause-overlay" class="pause-overlay hidden" role="dialog" aria-label="বিরতি / Paused"><div><h2>বিরতি / Paused</h2><p>মিশনের সময় থেমে আছে। / Mission time is paused.</p><button id="resume-game" type="button">চালু করুন / Resume</button></div></section>';
  const isGamePaused=()=>pauseState.isPaused(garageUI.open,!$('#settings-panel').classList.contains('hidden'));
  const syncSpeechPause=()=>nativeBridge.setSpeechPaused(isGamePaused());syncSpeechPause();
  const drivingInput=new DrivingInput(),input=drivingInput.values; const drivingBlocked=isGamePaused;
  const keyBindings={KeyW:['throttle',1],ArrowUp:['throttle',1],KeyS:['brake',1],ArrowDown:['brake',1],KeyA:['left',-1],ArrowLeft:['left',-1],KeyD:['right',1],ArrowRight:['right',1],Space:['handbrake',1],ShiftLeft:['nitro',1],ShiftRight:['nitro',1]};
  const onKey=(e,down)=>{const binding=keyBindings[e.code];if(!binding)return;const source=`key:${e.code}`;if(!down)drivingInput.release(source);const interactive=e.target?.closest?.('button, select, input, summary, a');if(drivingBlocked()||interactive)return;if(down&&!e.repeat)drivingInput.set(source,binding[0],binding[1]);e.preventDefault();};
  addEventListener('keydown',e=>onKey(e,true));addEventListener('keyup',e=>onKey(e,false));
  for(const button of document.querySelectorAll('[data-input]')){
    const key=button.dataset.input,value=Number(button.dataset.value),pointers=new Set();
    const start=e=>{if(drivingBlocked()||pointers.has(e.pointerId))return;e.preventDefault();pointers.add(e.pointerId);button.setPointerCapture(e.pointerId);button.classList.add('active');drivingInput.set(`button:${key}:${e.pointerId}`,key,value);};
    const stop=e=>{if(!pointers.delete(e.pointerId))return;drivingInput.release(`button:${key}:${e.pointerId}`);if(!pointers.size)button.classList.remove('active');if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);};
    button.addEventListener('pointerdown',start);button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);button.addEventListener('lostpointercapture',stop);
    button.addEventListener('clear-driving-input',()=>{for(const pointer of pointers)if(button.hasPointerCapture(pointer))button.releasePointerCapture(pointer);pointers.clear();button.classList.remove('active');});
  }
  const joystickBase=$('#joystick-base'),joystickKnob=$('#joystick-knob');let joystickPointer=-1;
  const moveJoystick=e=>{if(e.pointerId!==joystickPointer)return;const rect=joystickBase.getBoundingClientRect(),cx=rect.left+rect.width*.5,cy=rect.top+rect.height*.5,dx=e.clientX-cx,dy=e.clientY-cy,r=rect.width*.34,len=Math.hypot(dx,dy),scale=len>r?r/len:1,nx=dx*scale/r;drivingInput.set('joystick:left','left',Math.min(0,nx));drivingInput.set('joystick:right','right',Math.max(0,nx));joystickKnob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;};
  joystickBase.addEventListener('pointerdown',e=>{if(joystickPointer!==-1||drivingBlocked())return;e.preventDefault();joystickPointer=e.pointerId;joystickBase.setPointerCapture(e.pointerId);moveJoystick(e);});
  joystickBase.addEventListener('pointermove',moveJoystick);const releaseJoystick=e=>{if(e.pointerId!==joystickPointer)return;joystickPointer=-1;drivingInput.release('joystick:left');drivingInput.release('joystick:right');joystickKnob.style.transform='translate(0,0)';};joystickBase.addEventListener('pointerup',releaseJoystick);joystickBase.addEventListener('pointercancel',releaseJoystick);joystickBase.addEventListener('lostpointercapture',releaseJoystick);
  const clearDrivingInput=()=>{drivingInput.clear();for(const button of document.querySelectorAll('[data-input]'))button.dispatchEvent(new Event('clear-driving-input'));const captured=joystickPointer;joystickPointer=-1;if(captured!==-1&&joystickBase.hasPointerCapture(captured))joystickBase.releasePointerCapture(captured);joystickKnob.style.transform='translate(0,0)';};
  const setManualPause=paused=>{pauseState.manual=paused;clearDrivingInput();$('#pause-overlay').classList.toggle('hidden',!paused);if(paused)$('#resume-game').focus({preventScroll:true});else if(!garageUI.open&&$('#settings-panel').classList.contains('hidden'))canvas.focus({preventScroll:true});};
  $('#pause-game').addEventListener('click',()=>{$('#settings-panel').classList.add('hidden');setManualPause(true);});
  $('#resume-game').addEventListener('click',()=>setManualPause(false));
  addEventListener('keydown',e=>{if(e.code!=='Escape'||e.repeat||e.target?.closest?.('select, input'))return;e.preventDefault();if(garageUI.open){garageUI.setOpen(false);clearDrivingInput();}else if(!$('#settings-panel').classList.contains('hidden')){$('#settings-panel').classList.add('hidden');clearDrivingInput();canvas.focus({preventScroll:true});}else setManualPause(!pauseState.manual);});
  addEventListener('blur',clearDrivingInput);document.addEventListener('visibilitychange',()=>{pauseState.pageVisible=!document.hidden;if(document.hidden)clearDrivingInput();});document.addEventListener('nativeAppState',e=>{pauseState.nativeActive=e.detail?.isActive!==false;if(!pauseState.nativeActive)clearDrivingInput();});
  $('#garage-launch').addEventListener('click',clearDrivingInput);$('#settings-toggle').addEventListener('click',clearDrivingInput);controlsChoice.addEventListener('change',clearDrivingInput);
  for(const selector of ['#garage-launch','#garage-close','#settings-toggle','#show-first-drive-guide','#pause-game','#resume-game'])$(selector).addEventListener('click',syncSpeechPause);
  addEventListener('keydown',e=>{if(e.code==='Escape')syncSpeechPause();});
  document.addEventListener('visibilitychange',syncSpeechPause);document.addEventListener('nativeAppState',syncSpeechPause);
  const practiceRoot=document.createElement('div');ui.append(practiceRoot);
  const practiceView=new FirstDrivePracticeView(practiceRoot,()=>practice.finish('skipped'),()=>{if(!garageUI.open)canvas.focus({preventScroll:true});});
  const practice=new FirstDrivePractice(scene,state,body,modeSession,drift,clearDrivingInput,(progress,status)=>{practiceView.render(progress,status);if(status!=='active'){previousSlip=0;nitroWasActive=false;boostRemaining=0;camera.position.set(state.x+Math.sin(state.yaw)*9,5.5,state.z+Math.cos(state.yaw)*9);if(!garageUI.open)canvas.focus({preventScroll:true});}});
  $('#guide-practice').addEventListener('click',()=>{if(!practice.start()){$('#guide-status').textContent='প্রথমে চলতি মোড বাতিল করুন। / Cancel the active mode first.';return;}$('#guide-status').textContent='';firstDriveGuide.dismiss();previousSlip=0;nitroWasActive=false;boostRemaining=0;camera.position.set(0,5.5,57);});
  $('#garage-launch').addEventListener('click',()=>{if(practice.active){practice.finish('skipped');practiceView.close();}});
  const recovery=new VehicleRecovery(physics,body,vehicleCollider,state,modeSession,drift,clearDrivingInput,props.items);
  $('#recover-vehicle').addEventListener('click',()=>{if(practice.active){$('#recovery-status').textContent='আগে অনুশীলন ছাড়ুন। / Skip practice first.';return;}const wasActive=modeSession.state.active;const ok=recovery.recover();if(ok){previousSlip=0;nitroWasActive=false;boostRemaining=0;camera.position.set(state.x,5.5,state.z+9);}$('#recovery-status').textContent=ok?(wasActive?'গাড়ি ফিরেছে; রান বাতিল। / Vehicle recovered; run cancelled.':'গাড়ি নিরাপদ স্থানে ফিরেছে। / Vehicle recovered.'):'নিরাপদ জায়গা পাওয়া যায়নি; রান অপরিবর্তিত। / No clear spot; run unchanged.';});
  for(const button of document.querySelectorAll('[data-action="horn"]'))button.addEventListener('pointerdown',()=>{if(!drivingBlocked()){EventBus.emit('hornPulse',{range:28});haptic(12);}});
  addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat&&!drivingBlocked()&&!e.target?.closest?.('button, select, input, summary, a')){EventBus.emit('hornPulse',{range:28});}});
  let simulationMs=0,boostRemaining=0;
  const comboHud=new ComboHud($('#combo'),combo.snapshot());const stylePopup=text=>comboHud.show(text);
  EventBus.on('driftTier',({tier})=>{stylePopup(['','BLUE SPARK · TIER 1','ORANGE SPARK · TIER 2','BANGLA OVERDRIVE · TIER 3'][tier]);});
  EventBus.on('driftBoost',({tier,nitro})=>{state.nitro=Math.min(state.nitroCap,state.nitro+nitro);state.boost=[1,1.15,1.3,1.5][tier];boostRemaining=[0,.8,1.3,2][tier];haptic(tier===3?[25,30,50]:18);});
  EventBus.on('nearMiss',()=>{haptic(20);state.style+=150;state.nitro=Math.min(state.nitroCap,state.nitro+12);profile.addTaka(5);EventBus.emit('styleAction',{points:150});stylePopup('BAPRE BAAP! NEAR MISS!');});
  EventBus.on('chaosGain',({points=75}={})=>{state.style+=points;profile.addTaka(8);EventBus.emit('styleAction',{points});haptic(14);stylePopup('BAZAAR CHAOS! +75');});
  EventBus.on('bossPhase',({label})=>{stylePopup(label);haptic(25);});
  EventBus.on('bossTelegraph',()=>stylePopup('BAPI SHOCKWAVE! DODGE!'));
  EventBus.on('bossDefeated',({reward})=>{profile.addTaka(reward);stylePopup(`BAPI DOWN! +৳${reward}`);});
  EventBus.on('bossHazardNear',()=>EventBus.emit('styleAction',{points:100}));
  EventBus.on('deliveryCheckpoint',({checkpoint,total})=>stylePopup(`DELIVERY CHECKPOINT · ${checkpoint}/${total}`));
  EventBus.on('rescueParcel',({index,total,saved,rescued})=>stylePopup(saved?`SUPPLY RESCUED ${rescued}/${total}`:`SUPPLY ${index} MISSED · STAY ON ROAD`));
  EventBus.on('droneRelay',({index,total,activated,relaysActivated})=>stylePopup(activated?`SHAPLA RELAY ${relaysActivated}/${total} ONLINE`:`RELAY ${index} MISSED · RETURN TO LANE`));
  EventBus.on('chaosGain',()=>modeSession.damage(5));
  EventBus.on('modeResult',({mode,medal,outcome,newBest})=>{const nominal=medal==='gold'?350:medal==='silver'?180:medal==='bronze'?80:0;const reward=newBest?nominal:0;if(reward)profile.addTaka(reward);const completed=outcome==='success';EventBus.emit(completed?'missionWin':'missionFail');stylePopup(completed?(medal==='none'?`${mode.toUpperCase()} COMPLETE · NO MEDAL`:`${medal.toUpperCase()} MEDAL${newBest?` · +৳${reward}`:' · BEST RETAINED'}`):'আরও একটু চেষ্টা!');});
  EventBus.on('vehicleChanged',({color})=>{if(color)paint.color.set(color);});
  EventBus.on('upgradePurchased',({upgrade})=>{if(upgrade==='nitroTank'){state.nitroCap+=12;state.nitro=Math.min(state.nitroCap,state.nitro+12);}});
  EventBus.on('liveryChanged',({id})=>{paint.color.set(id==='cream'?'#ddd3ba':id==='green'?'#7c9b68':'#dcae24');});
  EventBus.on('hornPulse',()=>{const now=simulationMs;for(const actor of built.actors){const dx=actor.x-state.x,dz=actor.z-state.z;if(dz<0&&-dz<28&&Math.abs(dx)<-dz*.54){if(actor.type==='cow'){if(actor.netaji&&Math.hypot(dx,dz)<10)actor.chargeUntil=now+1300;else actor.scatterUntil=now+1700;}else actor.yieldUntil=now+1800;}}});
  EventBus.on('comboChanged',snapshot=>{comboHud.setCombo(snapshot);if(snapshot.multiplier===5)$('#edge-glow').classList.add('overdrive');else $('#edge-glow').classList.remove('overdrive');});
  const fixed=1/60;let accumulator=0,last=performance.now(),fpsElapsed=0,frames=0;let previousSlip=0,nitroWasActive=false;
  const collisionFeedback=new CollisionFeedback(),collisionMessage=$('#collision-feedback');let collisionMessageVisible=false;
  const actorMotion=new RoadActorMotion(built.actors,vehicleCollider.shape);
  const playerPath={start:{x:0,y:1.1,z:0},end:{x:0,y:1.1,z:0},delta:{x:0,y:0,z:0},startRotation:{x:0,y:0,z:0,w:1},endRotation:{x:0,y:0,z:0,w:1}};
  const fixedUpdate=(dt)=>{
    const practicing=practice.active;
    playerPath.start.x=state.x;playerPath.start.z=state.z;playerPath.startRotation.y=Math.sin(state.yaw*.5);playerPath.startRotation.w=Math.cos(state.yaw*.5);
    if(!practicing)simulationMs+=dt*1000;if(boostRemaining>0){boostRemaining=Math.max(0,boostRemaining-dt);if(boostRemaining===0)state.boost=1;}
    const upgrades=profile.data.vehicleUpgrades;const grip=surfaceAt(state.x,state.z)*(1+(upgrades.driftTires||0)*.04); const steer=Number(input.left||0)+Number(input.right||0);const maxSpeed=(input.nitro?48:34)+(upgrades.engine||0)*1.5;const speedNorm=Math.min(1,Math.abs(state.speed)/maxSpeed);const steerFactor=1-.58*speedNorm;
    state.steer += (steer*steerFactor-state.steer)*Math.min(1,dt*8);const autoDrift=profile.data.settings.driftAssist&&Math.abs(state.speed)>12&&Math.abs(state.steer)>.82;state.handbrake=!!input.handbrake||autoDrift;
    const accel=Number(input.throttle||0)*18*state.boost*(1+(upgrades.engine||0)*.05)-(Number(input.brake||0)*22); state.speed+=accel*dt;state.speed*=Math.pow(input.handbrake?.985:.994,dt*60);state.speed=Math.max(-7,Math.min(maxSpeed,state.speed));
    const nitroActive=!!input.nitro&&state.nitro>0;if(nitroActive&&!nitroWasActive){EventBus.emit('nitro');haptic(10);}nitroWasActive=nitroActive;if(nitroActive){state.speed=Math.min(48,state.speed+12*dt);state.nitro=Math.max(0,state.nitro-18*dt);}
    const oldVx=state.vx,oldVz=state.vz,oldYaw=state.yaw;const nextYaw=oldYaw+state.steer*(.45+Math.abs(state.speed)/14)*dt*(Math.sign(state.speed)||1);
    if(nextYaw!==oldYaw&&vehicleCollision.rotationClear(state.x,state.y,state.z,nextYaw))state.yaw=nextYaw;
    let fx=Math.sin(state.yaw),fz=-Math.cos(state.yaw);const targetVx=fx*state.speed,targetVz=fz*state.speed;const lateral=Math.hypot(oldVx-targetVx,oldVz-targetVz);const result=practicing?false:drift.update(dt,lateral,state.speed,state.handbrake);
    const lateralGrip=Math.min(1,grip*(state.handbrake?.34:.86));const response=Math.min(1,dt*(result?2.4:6.5)*lateralGrip);state.vx+=(targetVx-state.vx)*response;state.vz+=(targetVz-state.vz)*response;
    const desiredX=state.vx*dt,desiredZ=state.vz*dt;
    const movement=vehicleCollision.move(desiredX,desiredZ);
    const showCollision=collisionFeedback.update(dt,desiredX,desiredZ,movement.x,movement.z);
    if(showCollision!==collisionMessageVisible){collisionMessageVisible=showCollision;collisionMessage.textContent=showCollision?'পথ আটকে গেছে — দিক বদলান বা Settings থেকে গাড়ি ফেরান। / Path blocked — change direction or recover in Settings.':'';}
    // A rotation clear at the starting point can still overlap an obstacle at the end of the sweep.
    if(state.yaw!==oldYaw&&!vehicleCollision.rotationClear(state.x+movement.x,state.y,state.z+movement.z,state.yaw)){state.yaw=oldYaw;fx=Math.sin(oldYaw);fz=-Math.cos(oldYaw);}
    state.x+=movement.x;state.z+=movement.z;
    // Only actual displacement contributes to velocity and mission progress after a collision.
    state.vx=movement.x/dt;state.vz=movement.z/dt;
    if(state.x>9||state.x< -9){state.x=Math.max(-9,Math.min(9,state.x));state.speed*=Math.min(.999,.97+(profile.data.vehicleUpgrades.bumper||0)*.006);state.vx*=-.25;if(!practicing)EventBus.emit('styleAction',{points:50});}
    if(practicing){if(state.z<12){state.z=12;state.vz=Math.max(0,state.vz);}if(state.z>55){state.z=55;state.vz=Math.min(0,state.vz);}}
    else if(state.z>60){state.z=-360;playerPath.start.x=state.x;playerPath.start.z=state.z;}
    playerPath.end.x=state.x;playerPath.end.z=state.z;playerPath.delta.x=state.x-playerPath.start.x;playerPath.delta.z=state.z-playerPath.start.z;playerPath.endRotation.y=Math.sin(state.yaw*.5);playerPath.endRotation.w=Math.cos(state.yaw*.5);
    vec.x=state.x;vec.y=1.1;vec.z=state.z;body.setNextKinematicTranslation(vec);quat.x=0;quat.y=playerPath.endRotation.y;quat.z=0;quat.w=playerPath.endRotation.w;body.setNextKinematicRotation(quat);if(!practicing)actorMotion.update(dt,state,simulationMs,playerPath);physics.step();
    const velocityMagnitude=Math.hypot(state.vx,state.vz);state.speed=velocityMagnitude*(state.vx*fx+state.vz*fz<0?-1:1);state.speedKmh=Math.round(velocityMagnitude*3.6);state.drifting=result;
    vfxState.x=state.x;vfxState.yaw=state.yaw;vfxState.z=state.z;vfxState.speed=state.speed;vfxState.drifting=result;vfxState.handbrake=state.handbrake;vfxState.nitro=!!input.nitro&&state.nitro>0;vfxState.tier=drift.tier;vfx.update(dt,vfxState);
    if(result&&!previousSlip){EventBus.emit('styleAction',{points:100});}previousSlip=result;
    if(practicing)practice.update(input);else{nearMiss.update(dt,state,built.actors,state.speed*3.6);props.hitTest(state.x,state.z,state.speed);props.update(dt,state.z);boss.update(dt,state);chevrons.update(dt,state.x,state.z);combo.update(dt);modeSession.update(dt,state);objectiveMarkers.update(modeSession.state,state);ghost.update(dt,state);}comboHud.update(dt);commentary.update(dt);
  };
  const cameraPos=new THREE.Vector3(),lookAt=new THREE.Vector3();let renderNow=0;
  function frame(now){requestAnimationFrame(frame);const rawDeltaMs=now-last,delta=Math.min(.05,rawDeltaMs/1000),paused=isGamePaused();nativeBridge.setSpeechPaused(paused);last=now;if(paused)accumulator=0;else{accumulator+=delta;while(accumulator>=fixed){fixedUpdate(fixed);accumulator-=fixed;}}renderNow=now;
    car.position.set(state.x,state.y,state.z);car.rotation.y=state.yaw;car.rotation.z=reducedMotion?0:state.steer*state.speed*.008*(1-(profile.data.vehicleUpgrades.suspension||0)*.08)*(state.drifting?1.4:.7);
    cameraPos.set(state.x+Math.sin(state.yaw)*9,5.5,state.z+Math.cos(state.yaw)*9);camera.position.lerp(cameraPos,.12);lookAt.set(state.x,1.0,state.z-4);camera.lookAt(lookAt);
    $('#speed').textContent=String(state.speedKmh||0);const speedEl=$('.speed');if(speedEl)speedEl.style.borderBottom=`3px solid hsl(${Math.max(0,120-(state.speedKmh||0)*1.5)},85%,52%)`;
    quality.sample(delta*1000,delta);frames++;fpsElapsed+=delta;if(fpsElapsed>1){renderer.render(scene,camera);fpsElapsed=0;frames=0;}else renderer.render(scene,camera);
    if(frameDiagnostics.running)frameDiagnostics.observeFrame(rawDeltaMs,paused,renderer.info.render.calls,renderer.info.render.triangles);
    if(now%500<20){$('#taka').textContent=profile.data.taka;const modeHud=$('#mode-status-hud'),ms=modeSession.state;if(ms.active){modeHud.textContent=ms.mode==='Escape'?`ESCAPE · HEAT ${ms.heat}/3`:ms.mode==='Delivery'?`DELIVERY · ${Math.floor(ms.distance)}/${DELIVERY_RULES.distance}m · STABILITY ${Math.round(ms.integrity)}% · CP ${ms.checkpoints}/${Math.ceil(DELIVERY_RULES.distance/DELIVERY_RULES.checkpointDistance)}`:ms.mode==='Rescue'?`RESCUE · ${Math.floor(ms.distance)}/${RESCUE_RULES.distance}m · PARCELS ${ms.rescued}/${RESCUE_RULES.pickupDistances.length} · CP ${ms.checkpoints}/${RESCUE_RULES.pickupDistances.length}`:ms.mode==='Drone Delivery'?`SHAPLA RELAY · ${Math.floor(ms.distance)}/${RELAY_RULES.distance}m · LINK ${ms.relaysActivated}/${RELAY_RULES.relayDistances.length} · KIT ${Math.round(ms.integrity)}%`: `${ms.mode.toUpperCase()} · ${Math.floor(ms.elapsed)}s · ${Math.floor(ms.score)}`;}else modeHud.textContent=modeResultText(ms.lastResult);}
  }
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);}addEventListener('resize',resize,{passive:true});resize();
  $('#boot-screen').style.opacity='0';setTimeout(()=>$('#boot-screen').remove(),550);requestAnimationFrame(frame);
  document.addEventListener('visibilitychange',()=>{last=performance.now();accumulator=0;});
  document.addEventListener('nativeAppState',()=>{last=performance.now();accumulator=0;});
  nativeBridge.setBackHandler(()=>{if(garageUI.open){garageUI.setOpen(false);return;}if(!$('#settings-panel').classList.contains('hidden')){$('#settings-panel').classList.add('hidden');canvas.focus({preventScroll:true});return;}if(pauseState.manual){setManualPause(false);return;}if(practice.active){practice.finish('skipped');return;}if(firstDriveGuide.open){firstDriveGuide.dismiss();return;}if(modeSession.state.active){modeSession.cancel('app-back');return;}if(globalThis.confirm('Exit Game? (হ্যাঁ / না)'))nativeBridge.exitApp();});
  addEventListener('pagehide',()=>{nativeBridge.dispose();ghost.dispose();vfx.dispose();objectiveMarkers.dispose();vehicleCollision.dispose();practice.dispose();});
  if(import.meta.env.DEV)window.__gameDebug={scene,renderer,physics,quality,profile,state,drift,combo,ghost,modeSession,objectiveMarkers,actors:built.actors};
}
boot().catch(fail);
