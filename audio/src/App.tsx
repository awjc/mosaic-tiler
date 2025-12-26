import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export default function SteamyAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const loopRef = useRef<Tone.Sequence | null>(null);
  const transportStarted = useRef(false);

  // All Tone.js objects (created once)
  const masterRef = useRef<Tone.Gain | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const bassRef = useRef<Tone.MembraneSynth | null>(null);
  const growlRef = useRef<Tone.Oscillator | null>(null);
  const growlFilterRef = useRef<Tone.Filter | null>(null);
  const growlGainRef = useRef<Tone.Gain | null>(null);
  const slurpNoiseRef = useRef<Tone.Noise | null>(null);
  const slurpFilterRef = useRef<Tone.Filter | null>(null);
  const slurpModRef = useRef<Tone.LFO | null>(null);
  const slurpGainRef = useRef<Tone.Gain | null>(null);
  const dripRef = useRef<Tone.MetalSynth | null>(null);
  const moanRef = useRef<Tone.FMSynth | null>(null);

  const initAudio = async () => {
    if (isLoaded) return;

    // Master chain
    masterRef.current = new Tone.Gain(0.8).toDestination();

    // Wet reverb
    reverbRef.current = new Tone.Reverb(6).connect(masterRef.current!);
    reverbRef.current.wet.value = 0.6;

    // Deep throbbing bass
    bassRef.current = new Tone.MembraneSynth({
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.6 },
    }).connect(reverbRef.current);
    bassRef.current.volume.value = -6;

    // Low growl
    growlRef.current = new Tone.Oscillator({
      type: "sawtooth",
      frequency: 110,
    }).start();
    growlFilterRef.current = new Tone.Filter(250, "lowpass").connect(
      reverbRef.current
    );
    growlGainRef.current = new Tone.Gain(0).connect(growlFilterRef.current);
    growlRef.current.connect(growlGainRef.current);

    // Wet slurp / deep throat noise
    slurpNoiseRef.current = new Tone.Noise("pink").start();
    slurpFilterRef.current = new Tone.Filter({
      type: "bandpass",
      frequency: 600,
      Q: 4,
    });
    slurpModRef.current = new Tone.LFO(3, 400, 1200).start();
    slurpModRef.current.connect(slurpFilterRef.current.frequency);
    slurpGainRef.current = new Tone.Gain(0).connect(reverbRef.current);
    slurpNoiseRef.current
      .connect(slurpFilterRef.current)
      .connect(slurpGainRef.current);

    // Drool drips
    dripRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
    }).connect(reverbRef.current);
    dripRef.current.volume.value = -18;
    dripRef.current.frequency.value = 800;

    // Breathy moans
    moanRef.current = new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: 12,
      oscillator: { type: "sine" },
      envelope: { attack: 0.8, decay: 1, sustain: 0.7, release: 2 },
      modulation: { type: "triangle" },
      modulationEnvelope: { attack: 0.6, decay: 0.5, sustain: 0.8 },
    }).connect(reverbRef.current);
    moanRef.current.volume.value = -12;

    // Main sequence
    loopRef.current = new Tone.Sequence(
      (time, step) => {
        // Slow heartbeat bass
        if (step % 2 === 0) {
          bassRef.current?.triggerAttackRelease("C1", "2n", time);
        }

        // Deep growl swells
        growlGainRef.current?.gain.rampTo(0.35, 0.8, time);
        Tone.Draw.schedule(() => {
          growlGainRef.current?.gain.rampTo(0, 1);
        }, time + 1.5);

        // Long, thick slurps
        slurpGainRef.current?.gain.setValueAtTime(0.4, time);
        slurpGainRef.current?.gain.exponentialRampToValueAtTime(
          0.01,
          time + 1.2
        );

        // Random drool drips
        if (Math.random() > 0.6) {
          dripRef.current?.triggerAttackRelease(
            "8n",
            time + Math.random() * 0.5
          );
        }

        // Building moans
        if (step % 4 === 2) {
          moanRef.current?.triggerAttackRelease("G3", "2m", time + 0.5);
        }
        if (step % 8 === 6) {
          moanRef.current?.triggerAttackRelease("Bb3", "4m", time + 1, 0.6);
        }
      },
      [0, 1, 2, 3, 4, 5, 6, 7],
      "1m"
    );

    Tone.Transport.bpm.value = 420;
    Tone.Transport.swing = 0.2;

    setIsLoaded(true);
  };

  const togglePlay = async () => {
    await Tone.start(); // Needed for user gesture

    if (!isLoaded) {
      await initAudio();
    }

    if (isPlaying) {
      Tone.Transport.stop();
      loopRef.current?.stop();
      setIsPlaying(false);
    } else {
      if (!transportStarted.current) {
        loopRef.current?.start(0);
        transportStarted.current = true;
      }
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Tone.Transport.stop();
      loopRef.current?.dispose();
      Tone.Transport.cancel();
    };
  }, []);

  return (
    <div
      style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h2>🐂 Deep & Dripping Audio Loop</h2>
      <p>Slow, thick, and very steamy…</p>
      <button
        onClick={togglePlay}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          background: isPlaying ? "#c44" : "#4c4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {isPlaying ? "Pause" : "Play"} 💦
      </button>
      {isPlaying && (
        <p style={{ marginTop: "1rem", color: "#888" }}>
          Looping… enjoy the slurp
        </p>
      )}
    </div>
  );
}

