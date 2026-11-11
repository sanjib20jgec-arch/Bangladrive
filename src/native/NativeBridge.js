import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { ProfileMirror } from './ProfileMirror.js';

const PROFILE_KEY='bangladrive_save_v6';
export class NativeBridge {
  constructor(){this.native=false;this.backHandler=null;this.listeners=[];this.lastSpeak=0;this.voiceEnabled=true;this.speechPaused=false;this.speechGeneration=0;this.profileMirror=null;}
  async initialize(){
    this.native=Capacitor.isNativePlatform();globalThis.__nativeBridge=this;
    if(!this.native)return false;
    this.profileMirror=new ProfileMirror(Preferences,PROFILE_KEY);
    let localStorage;try{localStorage=globalThis.localStorage;}catch{/* access may be denied */}
    await this.profileMirror.initialize(localStorage);
    try{await StatusBar.hide();}catch(error){console.warn('Status bar hide failed',error);}
    try{await SplashScreen.hide();}catch(error){/* splash may already be hidden */}
    try{await KeepAwake.keepAwake();}catch(error){console.warn('Keep-awake unavailable',error);}
    const appState=await App.addListener('appStateChange',async({isActive})=>{document.dispatchEvent(new CustomEvent('nativeAppState',{detail:{isActive}}));if(!isActive)this.stopSpeech();try{if(isActive)await KeepAwake.keepAwake();else await KeepAwake.allowSleep();}catch{/* lifecycle cleanup is best-effort */}});this.listeners.push(appState);
    const back=await App.addListener('backButton',()=>{if(this.backHandler)this.backHandler();});this.listeners.push(back);
    return true;
  }
  setBackHandler(handler){this.backHandler=handler;}
  persistProfile(value){if(!this.native||!this.profileMirror)return Promise.resolve(false);return this.profileMirror.persist(value);}
  async haptic(pattern=12){if(!this.native){globalThis.navigator?.vibrate?.(pattern);return;}const duration=Array.isArray(pattern)?pattern.reduce((sum,n)=>sum+n,0):pattern;const style=duration>=45?ImpactStyle.Heavy:duration>=20?ImpactStyle.Medium:ImpactStyle.Light;try{await Haptics.impact({style});}catch{/* optional device feature */}}
  setVoiceEnabled(enabled){this.voiceEnabled=enabled===true;if(!this.voiceEnabled)this.stopSpeech();}
  setSpeechPaused(paused){paused=!!paused;if(this.speechPaused===paused)return;this.speechPaused=paused;if(paused)this.stopSpeech();}
  stopSpeech(){this.speechGeneration++;globalThis.speechSynthesis?.cancel();if(this.native)TextToSpeech.stop().catch(()=>{});}
  async speak(text,{lang='bn-BD',rate=.88,pitch=.92}={}){
    if(!text||!this.voiceEnabled||this.speechPaused)return false;
    const now=Date.now();if(now-this.lastSpeak<800)return false;this.lastSpeak=now;
    const generation=this.speechGeneration;
    if(!this.native){if(!('speechSynthesis'in globalThis)||!('SpeechSynthesisUtterance'in globalThis))return false;globalThis.speechSynthesis.cancel();const utterance=new globalThis.SpeechSynthesisUtterance(text);utterance.lang='bn-IN';utterance.rate=rate;utterance.pitch=pitch;globalThis.speechSynthesis.speak(utterance);return true;}
    try{let chosen=lang;const support=await TextToSpeech.isLanguageSupported({lang:chosen});if(!support.supported){const fallback=await TextToSpeech.isLanguageSupported({lang:'bn-IN'});chosen=fallback.supported?'bn-IN':'en-IN';}if(!this.voiceEnabled||this.speechPaused||generation!==this.speechGeneration)return false;await TextToSpeech.speak({text,lang:chosen,rate,pitch,volume:1,category:'ambient'});return true;}catch{return false;}
  }
  async exitApp(){if(this.native)await App.exitApp();}
  async dispose(){for(const listener of this.listeners)try{await listener.remove();}catch{}this.listeners.length=0;try{await KeepAwake.allowSleep();}catch{}}
}
