"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * Wrappers around the two browser speech APIs.
 *
 * Support is uneven — Firefox has no SpeechRecognition at all — so both hooks
 * report a `supported` flag and every caller renders a usable fallback.
 */

const noSubscription = () => () => {};
const alwaysFalse = () => false;

/**
 * Reads a browser feature flag that can only be known on the client.
 *
 * `useSyncExternalStore` is the right primitive for this: it renders the
 * server snapshot (`false`) during SSR and hydration, then switches to the
 * real client value — without the hydration mismatch or the extra
 * render-then-setState pass a `useEffect` + `useState` combo would cause.
 */
function useClientFeature(check: () => boolean): boolean {
  return useSyncExternalStore(noSubscription, check, alwaysFalse);
}

export function useSpeechSynthesis() {
  const supported = useClientFeature(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
  );
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback(
    (text: string, rate = 0.95) => {
      if (!supported) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [supported],
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, speaking, speak, stop };
}

export type RecognitionError =
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "unknown";

interface UseSpeechRecognitionOptions {
  onFinalResult?: (transcript: string) => void;
}

function getRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition({
  onFinalResult,
}: UseSpeechRecognitionOptions = {}) {
  const supported = useClientFeature(() => getRecognitionConstructor() !== null);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<RecognitionError | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Kept in a ref so restarting recognition never re-subscribes handlers.
  // Written from an effect, not during render, so React's ref-purity check
  // doesn't flag it — effects are the sanctioned place to synchronize refs.
  const onFinalResultRef = useRef(onFinalResult);
  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  });

  useEffect(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) final += text;
        else interim += text;
      }

      setTranscript(final || interim);
      if (final) onFinalResultRef.current?.(final.trim());
    };

    recognition.onerror = (event) => {
      const known: RecognitionError[] = [
        "not-allowed",
        "no-speech",
        "audio-capture",
        "network",
      ];
      setError(
        known.includes(event.error as RecognitionError)
          ? (event.error as RecognitionError)
          : "unknown",
      );
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    setTranscript("");
    setError(null);

    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if it is already running; treat that as already-on.
      setListening(true);
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return { supported, listening, transcript, error, start, stop, reset };
}

export function recognitionErrorMessage(error: RecognitionError): string {
  switch (error) {
    case "not-allowed":
      return "Microphone access was blocked. Allow it in your browser settings and try again.";
    case "no-speech":
      return "We didn't hear anything. Try again and speak a little louder.";
    case "audio-capture":
      return "No microphone was found. Check that one is connected.";
    case "network":
      return "Speech recognition needs a network connection. Check yours and retry.";
    default:
      return "Speech recognition stopped unexpectedly. Please try again.";
  }
}
