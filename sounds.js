(function () {
  let audio = null;
  function getAudio() {
    if (!audio) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audio = new AudioCtx();
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  function envelope(context, now, duration, volume) {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gain.connect(context.destination);
    return gain;
  }

  function chirp(start, middle, end, duration, volume) {
    const context = getAudio();
    if (!context) return;
    const oscillator = context.createOscillator();
    const now = context.currentTime;
    const gain = envelope(context, now, duration, volume);
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.linearRampToValueAtTime(middle, now + duration * 0.42);
    oscillator.frequency.linearRampToValueAtTime(end, now + duration);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
  }

  function bell(frequency, delay, duration, volume) {
    const context = getAudio();
    if (!context) return;
    const now = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = envelope(context, now, duration, volume);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
  }

  function splash() {
    const context = getAudio();
    if (!context) return;
    const now = context.currentTime;
    const duration = 0.34;
    const source = context.createBufferSource();
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const progress = i / data.length;
      data[i] = (Math.random() * 2 - 1) * (1 - progress) * (1 - progress);
    }
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.frequency.exponentialRampToValueAtTime(260, now + duration);
    const gain = envelope(context, now, duration, 0.16);
    source.connect(filter);
    filter.connect(gain);
    source.start(now);
    source.stop(now + duration);
  }

  window.SOUNDS = {
    flap: function () {
      try {
        chirp(980, 420, 720, 0.18, 0.14);
      } catch (error) {}
    },
    score: function () {
      try {
        bell(880, 0, 0.22, 0.13);
        bell(1320, 0.085, 0.25, 0.11);
      } catch (error) {}
    },
    crash: function () {
      try {
        splash();
      } catch (error) {}
    }
  };
})();
