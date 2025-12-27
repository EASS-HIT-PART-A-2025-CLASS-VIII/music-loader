import * as Tone from "tone";

export async function enableAudio() {
    await Tone.start();
    console.log("Audio is enabled");
};

let pianoSampler;
let activePart;
export async function ToneExample(piece, bpm = 120) {
  console.log("ToneExample piece:", piece);
  // Make sure the audio context is running (some browsers suspend it).
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }
  // Hard reset transport between plays to avoid stuck timeline state.
  Tone.getTransport().stop();
  Tone.getTransport().cancel(0);
  Tone.getTransport().position = 0;
  // Apply requested tempo before scheduling notes.
  const targetBpm = Number.isFinite(Number(bpm)) ? Number(bpm) : 120;
  Tone.getTransport().bpm.value = targetBpm;

  if (activePart) {
    activePart.cancel(0);
    activePart.stop();
    activePart.dispose();
    activePart = null;
  }

  if (!pianoSampler) {
    let resolveLoad;
    let rejectLoad;
    const loadPromise = new Promise((resolve, reject) => {
      resolveLoad = resolve;
      rejectLoad = reject;
    });

    pianoSampler = new Tone.Sampler(
      {
        A1: "A1.mp3",
        C2: "C2.mp3",
        C3: "C3.mp3",
        C4: "C4.mp3",
        C5: "C5.mp3"
      },
      {
        release: 2,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => resolveLoad(),
        onerror: (err) => rejectLoad(err)
      }
    ).toDestination();

    await loadPromise;
  }
  // Ensure sampler buffers are ready if it was initialized earlier.
  if (pianoSampler && !pianoSampler.loaded) {
    await Tone.loaded();
  }
  // Release any lingering voices from previous playback.
  pianoSampler.releaseAll?.(Tone.now());

  // Normalize and order events by time to avoid scheduling conflicts.
  const normalizedEvents = Array.isArray(piece)
    ? [...piece]
        .map((evt) => ({
          ...evt,
          time: Tone.Time(evt?.time ?? 0).toSeconds()
        }))
        .sort((a, b) => (a.time ?? 0) - (b.time ?? 0))
    : [];

  if (!normalizedEvents.length) {
    console.warn("No events to play.");
    return;
  }

  activePart = new Tone.Part((time, value) => {
    //time =time*2; // speed 1/2 --> causes issues with scheduling
    const notes =
      Array.isArray(value?.notes) && value.notes.length
        ? value.notes
        : Array.isArray(value?.note)
          ? value.note
          : value?.note
            ? [value.note]
            : [];
    if (!notes.length) {
      return;
    }
    const duration = (value?.duration ) //longer release for each note
      ? Tone.Time(value.duration*2).toSeconds()
      : 1;
    const velocity = value?.velocity ?? 0.8;
    pianoSampler.triggerAttackRelease(notes, duration, time, velocity);
  }, normalizedEvents);

  activePart.loop = false;
  activePart.start(0);
  const lastTime = normalizedEvents[normalizedEvents.length - 1].time ?? 0;
  const endTime = lastTime + 5; // allow release tail
  activePart.stop(endTime);
  Tone.getTransport().start(); // start immediately

};

export function stopPlayback() {
  // Stop transport and clear scheduled events.
  Tone.getTransport().stop();
  Tone.getTransport().cancel(0);
  Tone.getTransport().position = 0;

  // Dispose of any active part to avoid lingering callbacks.
  if (activePart) {
    activePart.cancel(0);
    activePart.stop();
    activePart.dispose();
    activePart = null;
  }

  // Release any sustained notes.
  pianoSampler?.releaseAll?.(Tone.now());
}

export function setTempo(bpm = 120) {
  const targetBpm = Number.isFinite(Number(bpm)) ? Number(bpm) : 120;
  Tone.getTransport().bpm.rampTo(targetBpm, 0.1);
}
