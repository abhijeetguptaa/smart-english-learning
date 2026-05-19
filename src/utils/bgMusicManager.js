let audio = null;
const MUSIC_SRC = '/background-music.mp3';
import { getGameVolume } from './soundUtils';

export function setMusicVolume(volume) {
  if (audio) {
    audio.volume = volume;
  }
}

export function playMusic() {
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

export function pauseMusic() {
  if (audio) {
    audio.pause();
  }
}
