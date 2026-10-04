import { getGameVolume } from './soundUtils';

let audio: HTMLAudioElement | null = null;
const MUSIC_SRC = '/background-music.mp3';

export function setMusicVolume(volume: number): void {
  if (audio) {
    audio.volume = volume;
  }
}

export function playMusic(): void {
  if (!audio) {
    audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = getGameVolume();
  }
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.log('Audio play failed:', error);
    });
  }
}

export function pauseMusic(): void {
  if (audio) {
    audio.pause();
  }
}
