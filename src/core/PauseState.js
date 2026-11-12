// UI, lifecycle and manual pause sources are independent: clearing one cannot resume another.
export class PauseState {
  constructor() { this.manual = false; this.pageVisible = true; this.nativeActive = true; }
  isPaused(garageOpen = false, settingsOpen = false) {
    return this.manual || !this.pageVisible || !this.nativeActive || garageOpen || settingsOpen;
  }
}
