class MusicController {
  constructor() {
    this.currentAudio = null;
    this.currentScreen = parseInt(
      window.location.pathname.match(/screen(\d+)\.html/)?.[1] || 1
    );
    this.audioElements = {};
    this.isPlaying = false;
    this.seekBars = new Map(); // Track seekbars for each audio

    this.init();
  }

  init() {
    // Initialize audio for current screen
    this.audioElements[this.currentScreen] = new Audio(
      `../musicFiles/music${this.currentScreen}.mp3`
    );
    this.currentAudio = this.audioElements[this.currentScreen];

    // Setup event listeners for all play buttons
    document.querySelectorAll(".play-btn").forEach((btn) => {
      btn.addEventListener("click", this.handlePlayPause.bind(this));
    });

    // Setup seek bars
    document.querySelectorAll(".seek-bar").forEach((seekBar) => {
      const audioId = seekBar.id.replace("seekBar", "");
      this.seekBars.set(audioId, seekBar);

      // Initialize seek bar
      seekBar.value = 0;

      // Add input event
      seekBar.addEventListener("input", (e) => {
        if (this.currentAudio) {
          const seekTime = (e.target.value / 100) * this.currentAudio.duration;
          this.currentAudio.currentTime = seekTime;
        }
      });
    });

    // Setup timeupdate listener for the current audio
    this.currentAudio.addEventListener("timeupdate", () => {
      const seekBar = document.getElementById(`seekBar${this.currentScreen}`);
      if (seekBar && this.currentAudio.duration) {
        seekBar.value =
          (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
      }
    });

    // Reset on audio end
    this.currentAudio.addEventListener("ended", () => {
      const seekBar = document.getElementById(`seekBar${this.currentScreen}`);
      if (seekBar) {
        seekBar.value = 0;
      }
      this.isPlaying = false;
      this.updatePlayButtons();
    });

    // Pause music when navigating away
    window.addEventListener("beforeunload", () => {
      if (this.isPlaying) {
        this.currentAudio.pause();
      }
    });
  }

  handlePlayPause(e) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.currentAudio) {
      this.currentAudio = new Audio(
        `../musicFiles/music${this.currentScreen}.mp3`
      );
      this.audioElements[this.currentScreen] = this.currentAudio;
    }

    if (this.isPlaying) {
      this.currentAudio.pause();
    } else {
      // Pause any other playing audio
      Object.values(this.audioElements).forEach((audio) => {
        if (audio !== this.currentAudio) audio.pause();
      });

      this.currentAudio
        .play()
        .catch((err) => console.error("Audio play error:", err));
    }

    this.isPlaying = !this.isPlaying;
    this.updatePlayButtons();
  }

  updatePlayButtons() {
    document.querySelectorAll(".play-btn img").forEach((img) => {
      img.src = this.isPlaying
        ? img.src.replace("play-red1.png", "play-red2.png")
        : img.src.replace("play-red2.png", "play-red1.png");
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.musicController = new MusicController();
});
