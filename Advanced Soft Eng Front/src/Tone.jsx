import * as Tone from "tone";

export async function enableAudio() {
    await Tone.start();
    console.log("Audio is enabled");
};

let pianoSampler;
export async function ToneExample(piece) {
  console.log("ToneExample piece:", piece);
  Tone.getTransport().stop();
  Tone.getTransport().cancel();

    if (!pianoSampler) {
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
          baseUrl: "https://tonejs.github.io/audio/salamander/"
        }
      ).toDestination();
      await pianoSampler.loaded;
    }

    const part = new Tone.Part((time, value) => {
      pianoSampler.triggerAttackRelease(value.note, value.duration, time, value.velocity);
    }, piece);

    part.start(0);
    Tone.getTransport().start();

};
