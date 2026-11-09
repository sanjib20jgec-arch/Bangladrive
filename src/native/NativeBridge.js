import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

const PROFILE_KEY='bangladrive_save_v6';
export class NativeBridge {
  constructor(){this.native=false;this.backHandler=null;this.listeners=[];this.lastSpeak=0;}
  async initialize(){
    this.native=Capacitor.isNativePlatform();globalThis.__nativeBridge=this;
    if(!this.native)return false;
    try{const saved=await Preferences.get({key:PROFILE_KEY});if(saved.value&&!globalThis.localStorage.getItem(PROFILE_KEY))globalThis.localStorage.setItem(PROFILE_KEY,saved.value);}catch(error){console.warn('Native profile hydrate failed',error);}
    try{await StatusBar.hide();}catch(error){console.warn('Status bar hide failed',error);}
    try{await SplashScreen.hide();}catch(error){/* splash may already be hidden */}
    try{await KeepAwake.keepAwake();}catch(error){console.warn('Keep-awake unavailable',error);}
    const appState=await App.addListener('appStateChange',async({isActive})=>{document.dispatchEvent(new CustomEvent('nativeAppState',{detail:{isActive}}));if(!isActive){try{await TextToSpeech.stop();}catch{}globalThis.speechSynthesis?.cancel();}try{if(isActive)await KeepAwake.keepAwake();else await KeepAwake.allowSleep();}catch{/* lifecycle cleanup is best-effort */}});this.listeners.push(appState);
    const back=await App.addListener('backButton',()=>{if(this.backHandler)this.backHandler();});this.listeners.push(back);
    return true;
  }
  setBackHandler(handler){this.backHandler=handler;}
  async persistProfile(value){if(!this.native)return;try{await Preferences.set({key:PROFILE_KEY,value});}catch(error){console.warn('Native profile save failed',error);}}
  async haptic(pattern=12){if(!this.native){globalThis.navigator?.vibrate?.(pattern);return;}const duration=Array.isArray(pattern)?pattern.reduce((sum,n)=>sum+n,0):pattern;const style=duration>=45?ImpactStyle.Heavy:duration>=20?ImpactStyle.Medium:ImpactStyle.Light;try{await Haptics.impact({style});}catch{/* optional device feature */}}
  async speak(text,{lang='bn-BD',rate=.88,pitch=.92}={}){if(!text)return false;const now=Date.now();if(now-this.lastSpeak<800)return false;this.lastSpeak=now;if(!this.native){if(!('speechSynthesis'in globalThis)||!('SpeechSynthesisUtterance'in globalThis))return false;globalThis.speechSynthesis.cancel();const utterance=new globalThis.SpeechSynthesisUtterance(text);utterance.lang='bn-IN';utterance.rate=rate;utterance.pitch=pitch;globalThis.speechSynthesis.speak(utterance);return true;}try{let chosen=lang;const support=await TextToSpeech.isLanguageSupported({lang:chosen});if(!support.supported){const fallback=await TextToSpeech.isLanguageSupported({lang:'bn-IN'});chosen=fallback.supported?'bn-IN':'en-IN';}await TextToSpeech.speak({text,lang:chosen,rate,pitch,volume:1,category:'ambient'});return true;}catch{return false;}}
  async exitApp(){if(this.native)await App.exitApp();}
  async dispose(){for(const listener of this.listeners)try{await listener.remove();}catch{}this.listeners.length=0;try{await KeepAwake.allowSleep();}catch{}}
}
