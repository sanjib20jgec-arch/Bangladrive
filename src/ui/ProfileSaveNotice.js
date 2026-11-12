import { EventBus } from '../core/EventBus.js';

export class ProfileSaveNotice {
  constructor(root, settingsRoot, profile, nativeMirror = null) {
    this.root = root; this.profile = profile; this.nativeMirror = nativeMirror;
    root.innerHTML = '<p id="save-warning" class="save-warning hidden" role="status" aria-live="polite"></p>';
    this.warning = root.querySelector('#save-warning');
    this.details = document.createElement('details'); this.details.className = 'save-help hidden';
    this.details.innerHTML = `<summary>সেভের সমস্যা / Save problem</summary>
      <p id="save-detail"></p>
      <div id="protected-actions" class="hidden">
        <p>আগের তথ্য পড়া যাচ্ছে না বা অন্য সংস্করণের। নতুন করে লিখলে পুরোনো তথ্য হারাবে। আগে চাইলে নিচে কপি করুন। / The old entry is unreadable or from an unsupported version. Replacing it loses the original; copy it first if needed.</p>
        <button id="show-saved-data" type="button">আগের তথ্য দেখুন / Show original data</button>
        <label for="saved-data">নিজে কপি করুন / Copy manually</label><textarea id="saved-data" rows="4" readonly></textarea>
        <label class="toggle-setting"><input id="replace-save-confirm" type="checkbox"> পুরোনো তথ্য মুছে বর্তমান session দিয়ে বদলাতে চাই / I understand this replaces the original with this session</label>
        <button id="replace-save" type="button" disabled>সেভ বদলান / Replace save</button>
      </div>`;
    settingsRoot.append(this.details);
    this.detail = this.details.querySelector('#save-detail'); this.actions = this.details.querySelector('#protected-actions');
    this.confirm = this.details.querySelector('#replace-save-confirm'); this.replace = this.details.querySelector('#replace-save');
    this.data = this.details.querySelector('#saved-data');
    this.details.querySelector('#show-saved-data').addEventListener('click',()=>{ this.data.value = profile.lastRaw ?? ''; });
    this.confirm.addEventListener('change',()=>{this.replace.disabled=!this.confirm.checked;});
    this.replace.addEventListener('click',()=>{
      if (!this.confirm.checked) return;
      const replaced=profile.replaceProtectedSave();
      this.confirm.checked=false; this.replace.disabled=true;
      if (replaced) this.data.value='';
      this.render();
    });
    this.unsubscribe = EventBus.on('profileSaveStateChanged',()=>this.render());
    this.unsubscribeMirror = EventBus.on('nativeMirrorStateChanged',()=>this.render());
    this.render();
  }
  render() {
    const state=this.profile.saveState, mirror=this.nativeMirror?.state, localIssue=state!=='ok';
    const mirrorIssue=mirror==='conflict'||mirror==='unavailable', issue=localIssue||mirrorIssue;
    this.warning.classList.toggle('hidden',!issue);this.details.classList.toggle('hidden',!issue);
    this.warning.textContent=localIssue?'সেভ হচ্ছে না — Settings দেখুন। / Progress not saving — see Settings.':mirrorIssue?'Android backup সমস্যা — Settings দেখুন। / Android mirror issue — see Settings.':'';
    this.actions.classList.toggle('hidden',!this.profile.protectedSave || state==='changed');
    this.detail.textContent=state==='protected'?'মূল সেভ সুরক্ষিত; এই session অস্থায়ী। / Original protected; this session is temporary.'
      :state==='changed'?'অন্য জায়গায় সেভ বদলেছে; overwrite বন্ধ। অন্য tab বন্ধ করে reload করুন। / Save changed elsewhere; writes stopped. Close other tabs and reload.'
      :state==='unavailable'?'স্টোরেজ পাওয়া যায়নি বা পূর্ণ; এই session অস্থায়ী। / Storage unavailable or full; this session is temporary.' : '';
    if (mirrorIssue) this.detail.textContent += mirror==='conflict'
      ? ' Android-এর দুই সেভ আলাদা; mirror বন্ধ। কোনোটিই নিজে থেকে মুছবে না। / Android saves differ; mirroring stopped to avoid overwriting. Local save may still work.'
      : ' Android mirror পাওয়া যায়নি; local save কাজ করতে পারে। / Android mirror unavailable; local save may still work.';
  }
  dispose(){this.unsubscribe();this.unsubscribeMirror();}
}
