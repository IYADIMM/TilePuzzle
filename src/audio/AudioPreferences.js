export const DEFAULT_AUDIO_PREFERENCES=Object.freeze({
  musicEnabled:true,
  sfxEnabled:true,
  musicVolume:.35,
  sfxVolume:.55
});

export function normalizeAudioPreferences(raw={}){
  return{
    musicEnabled:raw.musicEnabled!==false,
    sfxEnabled:raw.sfxEnabled!==false,
    musicVolume:clampVolume(raw.musicVolume,DEFAULT_AUDIO_PREFERENCES.musicVolume),
    sfxVolume:clampVolume(raw.sfxVolume,DEFAULT_AUDIO_PREFERENCES.sfxVolume)
  };
}

export function isAudioFullyMuted(preferences){
  const prefs=normalizeAudioPreferences(preferences);
  return !prefs.musicEnabled&&!prefs.sfxEnabled;
}

function clampVolume(value,fallback){
  const number=Number(value);
  return Number.isFinite(number)?Math.max(0,Math.min(1,number)):fallback;
}
